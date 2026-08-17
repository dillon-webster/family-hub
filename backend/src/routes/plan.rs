use axum::Json;
use axum::extract::{Path, Query, State};
use chrono::{Duration, NaiveDate};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::events::Topic;
use crate::models::{MealSlot, PlanEntry, PlanKind};
use crate::state::AppState;

/// A week is always seven days from an explicit start date supplied by the
/// client, which is the only party that knows what timezone the house is in.
#[derive(Debug, Deserialize)]
pub struct WeekQuery {
    pub start: NaiveDate,
    #[serde(default = "seven")]
    pub days: i64,
}

fn seven() -> i64 {
    7
}

/// The longest span one request may ask for. A week is the common case, but
/// the history sheet asks for a couple of months at once so it can group them
/// into weeks client-side; the ceiling is here to keep an arbitrary `days=`
/// from turning into an unbounded scan.
const MAX_DAYS: i64 = 120;

impl WeekQuery {
    pub fn end(&self) -> NaiveDate {
        self.start + Duration::days(self.days.clamp(1, MAX_DAYS) - 1)
    }
}

pub async fn load_range(
    db: &PgPool,
    start: NaiveDate,
    end: NaiveDate,
) -> AppResult<Vec<PlanEntry>> {
    Ok(sqlx::query_as::<_, PlanEntry>(
        "select day, slot, kind, recipe_id, out_place, batch
           from plan_entries
          where day between $1 and $2
          order by day, slot",
    )
    .bind(start)
    .bind(end)
    .fetch_all(db)
    .await?)
}

pub async fn get_week(
    State(state): State<AppState>,
    Query(week): Query<WeekQuery>,
) -> AppResult<Json<Vec<PlanEntry>>> {
    Ok(Json(
        load_range(&state.db, week.start, week.end()).await?,
    ))
}

/// What a meal can be set to. The client sends the natural shape:
/// `{"recipe_id": "..."}` to cook, `{"leftovers": true}` for the fridge,
/// `{"place": "Pino's pizza"}` or `{}` to eat out.
///
/// One struct with optional fields rather than an untagged enum, which this was
/// and which failed open in the worst possible way: an untagged `Out` variant
/// accepts *any* object, because unknown fields are ignored. A cook request
/// carrying an unparseable `recipe_id` fell through to it and quietly planned
/// "eating out" — a wrong dinner on the wall and an ingredient list silently
/// short by one meal, with a 200 on the way back. Decided explicitly below, a
/// malformed id is a 422 instead.
#[derive(Debug, Deserialize)]
pub struct PlanInput {
    #[serde(default)]
    pub recipe_id: Option<Uuid>,
    /// How many times over. Absent means one.
    #[serde(default)]
    pub batch: Option<i16>,
    #[serde(default)]
    pub place: Option<String>,
    #[serde(default)]
    pub leftovers: bool,
}

/// The three things a meal can be, once the body has been read.
enum Decided {
    Cook { recipe_id: Uuid, batch: i16 },
    Leftovers,
    Out { place: Option<String> },
}

impl PlanInput {
    fn decide(self) -> Decided {
        // Leftovers is checked first: it is the only flag, so a body carrying
        // it means it however else it is decorated.
        if self.leftovers {
            return Decided::Leftovers;
        }
        match self.recipe_id {
            Some(recipe_id) => Decided::Cook {
                recipe_id,
                batch: self.batch.unwrap_or(1),
            },
            None => Decided::Out { place: self.place },
        }
    }
}

/// Send any approved week covering this day back to the review step.
///
/// Called when a meal starts being *cooked*, because that is the only change
/// that puts ingredients someone has not seen onto a committed list. Marking a
/// night as eating out, leftovers, or clearing it only ever takes things off,
/// and there is nothing to review about a shorter list.
///
/// Note what this does not do: decide what a week is. It unapproves whatever
/// weeks actually span the day, whichever Monday the client happened to use, so
/// the server still has no opinion about where a week starts.
async fn reopen_weeks_covering(db: &PgPool, day: NaiveDate) -> AppResult<()> {
    sqlx::query(
        "update week_meta
            set approved = false, approved_at = null
          where approved and $1 between week_start and week_start + 6",
    )
    .bind(day)
    .execute(db)
    .await?;
    Ok(())
}

/// Which meal is being set. A query parameter rather than part of the path
/// because dinner is overwhelmingly the common case and `PUT /plan/2026-08-10`
/// should keep meaning what it has always meant.
#[derive(Debug, Deserialize)]
pub struct SlotQuery {
    #[serde(default)]
    pub slot: MealSlot,
}

/// The largest batch the plan will record. Matches the database check; stated
/// here so the refusal is a sentence rather than a constraint violation.
const MAX_BATCH: i16 = 4;

pub async fn set_day(
    State(state): State<AppState>,
    Path(day): Path<NaiveDate>,
    Query(SlotQuery { slot }): Query<SlotQuery>,
    Json(input): Json<PlanInput>,
) -> AppResult<Json<PlanEntry>> {
    let entry = match input.decide() {
        Decided::Cook { recipe_id, batch } => {
            let exists: bool =
                sqlx::query_scalar("select exists(select 1 from recipes where id = $1)")
                    .bind(recipe_id)
                    .fetch_one(&state.db)
                    .await?;
            if !exists {
                return Err(AppError::NotFound("That recipe is not in the library."));
            }

            if !(1..=MAX_BATCH).contains(&batch) {
                return Err(AppError::BadRequest(format!(
                    "A night can be cooked between 1 and {MAX_BATCH} times over."
                )));
            }

            let entry = sqlx::query_as::<_, PlanEntry>(
                "insert into plan_entries (day, slot, kind, recipe_id, out_place, batch)
                 values ($1, $2, 'cook', $3, null, $4)
                 on conflict (day, slot) do update
                    set kind = 'cook', recipe_id = excluded.recipe_id,
                        out_place = null, batch = excluded.batch, updated_at = now()
                 returning day, slot, kind, recipe_id, out_place, batch",
            )
            .bind(day)
            .bind(slot)
            .bind(recipe_id)
            .bind(batch)
            .fetch_one(&state.db)
            .await?;

            // A dinner added after the week was signed off brings ingredients
            // nobody has been through. The list goes back to being a proposal
            // rather than quietly growing while someone is at the shop.
            reopen_weeks_covering(&state.db, day).await?;
            entry
        }
        Decided::Leftovers => sqlx::query_as::<_, PlanEntry>(
            "insert into plan_entries (day, slot, kind, recipe_id, out_place, batch)
                 values ($1, $2, 'leftovers', null, null, 1)
                 on conflict (day, slot) do update
                    set kind = 'leftovers', recipe_id = null, out_place = null,
                        batch = 1, updated_at = now()
                 returning day, slot, kind, recipe_id, out_place, batch",
        )
        .bind(day)
        .bind(slot)
        .fetch_one(&state.db)
        .await?,
        Decided::Out { place } => {
            let place = place.map(|p| p.trim().to_string()).filter(|p| !p.is_empty());

            sqlx::query_as::<_, PlanEntry>(
                "insert into plan_entries (day, slot, kind, recipe_id, out_place, batch)
                 values ($1, $2, 'out', null, $3, 1)
                 on conflict (day, slot) do update
                    set kind = 'out', recipe_id = null,
                        out_place = excluded.out_place, batch = 1, updated_at = now()
                 returning day, slot, kind, recipe_id, out_place, batch",
            )
            .bind(day)
            .bind(slot)
            .bind(place)
            .fetch_one(&state.db)
            .await?
        }
    };

    // An eating-out day contributes nothing to the list, but it still changes
    // it — the ingredients that day used to contribute have to come back off.
    state.bus.publish_all(&[Topic::Plan, Topic::Shopping]);
    Ok(Json(entry))
}

pub async fn clear_day(
    State(state): State<AppState>,
    Path(day): Path<NaiveDate>,
    Query(SlotQuery { slot }): Query<SlotQuery>,
) -> AppResult<Json<()>> {
    sqlx::query("delete from plan_entries where day = $1 and slot = $2")
        .bind(day)
        .bind(slot)
        .execute(&state.db)
        .await?;

    state.bus.publish_all(&[Topic::Plan, Topic::Shopping]);
    Ok(Json(()))
}

/// Meals in the range that are actually being cooked, each paired with how many
/// times over it is being made.
///
/// Every slot counts, not just dinner: a batch of something cooked on Sunday
/// for the week's lunches needs its ingredients bought the same as any dinner.
/// Eating out and leftovers are simply absent, which is how they stay off the
/// list — the whole reason for recording them.
pub async fn cooked_in_range(
    db: &PgPool,
    start: NaiveDate,
    end: NaiveDate,
) -> AppResult<Vec<(Uuid, i16)>> {
    let entries = load_range(db, start, end).await?;
    Ok(entries
        .into_iter()
        .filter(|e| e.kind == PlanKind::Cook)
        .filter_map(|e| e.recipe_id.map(|id| (id, e.batch.max(1))))
        .collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn query(days: i64) -> WeekQuery {
        WeekQuery {
            start: NaiveDate::from_ymd_opt(2026, 8, 3).unwrap(),
            days,
        }
    }

    #[test]
    fn a_week_ends_on_its_seventh_day() {
        // Inclusive: Monday plus seven days is the Sunday, not the next Monday.
        assert_eq!(query(7).end(), NaiveDate::from_ymd_opt(2026, 8, 9).unwrap());
    }

    #[test]
    fn a_history_span_survives_past_a_month() {
        // Eight weeks, which the old 31-day ceiling silently truncated to the
        // most recent month — the sheet would have rendered fewer weeks than it
        // asked for and looked like missing history rather than a clamp.
        assert_eq!(
            query(56).end(),
            NaiveDate::from_ymd_opt(2026, 9, 27).unwrap()
        );
    }

    #[test]
    fn an_absurd_span_is_capped() {
        assert_eq!(query(5_000).end(), query(MAX_DAYS).end());
    }

    #[test]
    fn a_zero_day_span_still_covers_its_start() {
        assert_eq!(query(0).end(), query(1).end());
    }

    fn decide(body: &str) -> Decided {
        serde_json::from_str::<PlanInput>(body).expect("valid body").decide()
    }

    #[test]
    fn the_three_shapes_a_meal_can_take() {
        assert!(matches!(
            decide(r#"{"recipe_id":"3f1a4c66-1d3c-4a4b-9f0e-2a7c9a4f1b23"}"#),
            Decided::Cook { batch: 1, .. }
        ));
        assert!(matches!(
            decide(r#"{"recipe_id":"3f1a4c66-1d3c-4a4b-9f0e-2a7c9a4f1b23","batch":2}"#),
            Decided::Cook { batch: 2, .. }
        ));
        assert!(matches!(decide(r#"{"leftovers":true}"#), Decided::Leftovers));
        assert!(matches!(decide("{}"), Decided::Out { place: None }));
        assert!(matches!(decide(r#"{"place":null}"#), Decided::Out { place: None }));

        match decide(r#"{"place":"Pino's pizza"}"#) {
            Decided::Out { place } => assert_eq!(place.as_deref(), Some("Pino's pizza")),
            _ => panic!("a named place is eating out"),
        }
    }

    #[test]
    fn an_unreadable_recipe_id_is_rejected_rather_than_read_as_eating_out() {
        // This was a silent wrong answer, not an error: as an untagged enum the
        // `Out` variant accepted any object, so a cook request with a bad id
        // deserialized as "eating out" and returned 200. The night showed the
        // wrong plan and the shopping list lost that meal's ingredients.
        for body in [r#"{"recipe_id":""}"#, r#"{"recipe_id":"not-a-uuid"}"#] {
            assert!(
                serde_json::from_str::<PlanInput>(body).is_err(),
                "{body} should be refused"
            );
        }

        // An explicit null is still eating out — that is the client's own
        // "no recipe" shape and always has been.
        assert!(matches!(
            decide(r#"{"recipe_id":null}"#),
            Decided::Out { place: None }
        ));
    }
}
