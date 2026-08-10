use axum::Json;
use axum::extract::{Path, Query, State};
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::collections::HashMap;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::events::Topic;
use crate::shopping::{self, AisleGroup, Extra, ItemState, PlannedRecipe};
use crate::state::AppState;

use super::plan;
use super::recipes;

#[derive(Debug, Deserialize)]
pub struct WeekParam {
    pub week_start: NaiveDate,
}

#[derive(Debug, Serialize)]
pub struct ShoppingList {
    pub week_start: NaiveDate,
    /// False until someone has been through the review step. Before that the
    /// generated items are shown as "waiting to be checked" rather than as the
    /// list proper.
    pub approved: bool,
    pub groups: Vec<AisleGroup>,
}

/// Rebuild the week's list from the plan.
pub async fn build_for_week(db: &PgPool, week_start: NaiveDate) -> AppResult<ShoppingList> {
    let week_end = week_start + chrono::Duration::days(6);

    let planned_ids = plan::cooked_recipe_ids(db, week_start, week_end).await?;
    let library = recipes::load_all(db).await?;

    // Follow plan order, and keep a repeated recipe listed once: cooking the
    // same dinner twice does not double the shopping, it just means two meals
    // draw on it.
    let mut planned: Vec<PlannedRecipe> = Vec::new();
    for id in &planned_ids {
        if let Some(recipe) = library.iter().find(|r| r.row.id == *id) {
            planned.push(PlannedRecipe {
                title: recipe.row.title.clone(),
                ingredients: recipe.ingredients.clone(),
            });
        }
    }

    let extras: Vec<Extra> = sqlx::query_as::<_, (Uuid, String, String, String, Option<Uuid>)>(
        "select id, name, qty, aisle, added_by
           from shopping_extras
          where week_start = $1
          order by created_at",
    )
    .bind(week_start)
    .fetch_all(db)
    .await?
    .into_iter()
    .map(|(id, name, qty, aisle, added_by)| Extra {
        id,
        name,
        qty,
        aisle,
        added_by,
    })
    .collect();

    let states: HashMap<String, ItemState> = sqlx::query_as::<_, (String, bool, bool)>(
        "select item_key, bought, skipped from shopping_states where week_start = $1",
    )
    .bind(week_start)
    .fetch_all(db)
    .await?
    .into_iter()
    .map(|(key, bought, skipped)| (key, ItemState { bought, skipped }))
    .collect();

    let approved: bool =
        sqlx::query_scalar("select coalesce((select approved from week_meta where week_start = $1), false)")
            .bind(week_start)
            .fetch_one(db)
            .await?;

    Ok(ShoppingList {
        week_start,
        approved,
        groups: shopping::build(&planned, &extras, &states),
    })
}

pub async fn get(
    State(state): State<AppState>,
    Query(param): Query<WeekParam>,
) -> AppResult<Json<ShoppingList>> {
    Ok(Json(build_for_week(&state.db, param.week_start).await?))
}

#[derive(Debug, Deserialize)]
pub struct ItemPatch {
    pub week_start: NaiveDate,
    pub key: String,
    pub bought: Option<bool>,
    pub skipped: Option<bool>,
    /// Who tapped it, so the phone can show the other person's initial.
    pub actor_id: Option<Uuid>,
}

/// Item keys are ingredient names ("olive oil"), so they travel in the body
/// rather than the path — no escaping, no ambiguity with slashes.
pub async fn patch_item(
    State(state): State<AppState>,
    Json(patch): Json<ItemPatch>,
) -> AppResult<Json<ShoppingList>> {
    if patch.key.trim().is_empty() {
        return Err(AppError::BadRequest("Missing item key.".into()));
    }

    sqlx::query(
        "insert into shopping_states (week_start, item_key, bought, skipped, actor_id)
         values ($1, $2, coalesce($3, false), coalesce($4, false), $5)
         on conflict (week_start, item_key) do update
            set bought   = coalesce($3, shopping_states.bought),
                skipped  = coalesce($4, shopping_states.skipped),
                actor_id = coalesce($5, shopping_states.actor_id),
                updated_at = now()",
    )
    .bind(patch.week_start)
    .bind(patch.key.trim())
    .bind(patch.bought)
    .bind(patch.skipped)
    .bind(patch.actor_id)
    .execute(&state.db)
    .await?;

    state.bus.publish(Topic::Shopping);
    Ok(Json(build_for_week(&state.db, patch.week_start).await?))
}

/// Commit the reviewed items to the list. Everything not marked "already have
/// it" becomes a real line the household is shopping for.
pub async fn approve(
    State(state): State<AppState>,
    Json(param): Json<WeekParam>,
) -> AppResult<Json<ShoppingList>> {
    sqlx::query(
        "insert into week_meta (week_start, approved, approved_at)
         values ($1, true, now())
         on conflict (week_start) do update set approved = true, approved_at = now()",
    )
    .bind(param.week_start)
    .execute(&state.db)
    .await?;

    state.bus.publish(Topic::Shopping);
    Ok(Json(build_for_week(&state.db, param.week_start).await?))
}

/// Send the week back to the review state — useful after the plan changes and
/// new ingredients need checking before they join the list.
pub async fn unapprove(
    State(state): State<AppState>,
    Json(param): Json<WeekParam>,
) -> AppResult<Json<ShoppingList>> {
    sqlx::query("update week_meta set approved = false where week_start = $1")
        .bind(param.week_start)
        .execute(&state.db)
        .await?;

    state.bus.publish(Topic::Shopping);
    Ok(Json(build_for_week(&state.db, param.week_start).await?))
}

#[derive(Debug, Deserialize)]
pub struct ExtraInput {
    pub week_start: NaiveDate,
    pub name: String,
    #[serde(default)]
    pub qty: Option<String>,
    pub aisle: String,
    pub added_by: Option<Uuid>,
}

pub async fn add_extra(
    State(state): State<AppState>,
    Json(input): Json<ExtraInput>,
) -> AppResult<Json<ShoppingList>> {
    let name = input.name.trim();
    if name.is_empty() {
        return Err(AppError::BadRequest("Type something to add.".into()));
    }

    // Sentence case, matching how the in-app keyboard presents it.
    let mut chars = name.chars();
    let name = match chars.next() {
        Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
        None => name.to_string(),
    };

    sqlx::query(
        "insert into shopping_extras (week_start, name, qty, aisle, added_by)
         values ($1, $2, $3, $4, $5)",
    )
    .bind(input.week_start)
    .bind(&name)
    .bind(input.qty.unwrap_or_else(|| "1".into()))
    .bind(&input.aisle)
    .bind(input.added_by)
    .execute(&state.db)
    .await?;

    state.bus.publish(Topic::Shopping);
    Ok(Json(build_for_week(&state.db, input.week_start).await?))
}

pub async fn delete_extra(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<()>> {
    sqlx::query("delete from shopping_extras where id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    state.bus.publish(Topic::Shopping);
    Ok(Json(()))
}
