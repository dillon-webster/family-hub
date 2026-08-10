use axum::Json;
use axum::extract::{Path, Query, State};
use chrono::{Duration, NaiveDate};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::events::Topic;
use crate::models::{PlanEntry, PlanKind};
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
        "select day, kind, recipe_id, out_place
           from plan_entries
          where day between $1 and $2
          order by day",
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

/// What a day can be set to. Untagged so the client sends the natural shape:
/// `{"recipe_id": "..."}` to cook, `{"place": "Pino's pizza"}` or `{}` to eat out.
#[derive(Debug, Deserialize)]
#[serde(untagged)]
pub enum PlanInput {
    Cook { recipe_id: Uuid },
    Out { place: Option<String> },
}

pub async fn set_day(
    State(state): State<AppState>,
    Path(day): Path<NaiveDate>,
    Json(input): Json<PlanInput>,
) -> AppResult<Json<PlanEntry>> {
    let entry = match input {
        PlanInput::Cook { recipe_id } => {
            let exists: bool =
                sqlx::query_scalar("select exists(select 1 from recipes where id = $1)")
                    .bind(recipe_id)
                    .fetch_one(&state.db)
                    .await?;
            if !exists {
                return Err(AppError::NotFound("That recipe is not in the library."));
            }

            sqlx::query_as::<_, PlanEntry>(
                "insert into plan_entries (day, kind, recipe_id, out_place)
                 values ($1, 'cook', $2, null)
                 on conflict (day) do update
                    set kind = 'cook', recipe_id = excluded.recipe_id,
                        out_place = null, updated_at = now()
                 returning day, kind, recipe_id, out_place",
            )
            .bind(day)
            .bind(recipe_id)
            .fetch_one(&state.db)
            .await?
        }
        PlanInput::Out { place } => {
            let place = place.map(|p| p.trim().to_string()).filter(|p| !p.is_empty());

            sqlx::query_as::<_, PlanEntry>(
                "insert into plan_entries (day, kind, recipe_id, out_place)
                 values ($1, 'out', null, $2)
                 on conflict (day) do update
                    set kind = 'out', recipe_id = null,
                        out_place = excluded.out_place, updated_at = now()
                 returning day, kind, recipe_id, out_place",
            )
            .bind(day)
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
) -> AppResult<Json<()>> {
    sqlx::query("delete from plan_entries where day = $1")
        .bind(day)
        .execute(&state.db)
        .await?;

    state.bus.publish_all(&[Topic::Plan, Topic::Shopping]);
    Ok(Json(()))
}

/// Days in the range that are actually being cooked, paired with their recipe.
/// Eating-out days are simply absent, which is how they stay off the list.
pub async fn cooked_recipe_ids(
    db: &PgPool,
    start: NaiveDate,
    end: NaiveDate,
) -> AppResult<Vec<Uuid>> {
    let entries = load_range(db, start, end).await?;
    Ok(entries
        .into_iter()
        .filter(|e| e.kind == PlanKind::Cook)
        .filter_map(|e| e.recipe_id)
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
}
