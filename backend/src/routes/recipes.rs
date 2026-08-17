use axum::Json;
use axum::extract::{Path, Query, State};
use serde::Deserialize;
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::events::Topic;
use crate::models::{Ingredient, Recipe, RecipeDraft, RecipeRow, RecipeSource};
use crate::state::AppState;

/// Load the whole library with its ingredients and steps.
///
/// Three queries rather than one join: the library is household-sized (tens of
/// recipes) and this keeps the row-fanout assembly obvious.
pub async fn load_all(db: &PgPool) -> AppResult<Vec<Recipe>> {
    let rows = sqlx::query_as::<_, RecipeRow>(
        "select r.id, r.category_id, c.name as category, r.title, r.time_label,
                r.time_minutes, r.serves_label, r.blurb, r.source, r.source_url,
                r.created_at
           from recipes r
           join recipe_categories c on c.id = r.category_id
          order by r.created_at",
    )
    .fetch_all(db)
    .await?;

    let ids: Vec<Uuid> = rows.iter().map(|r| r.id).collect();

    let ingredients: Vec<(Uuid, String, String)> = sqlx::query_as(
        "select recipe_id, qty, name from ingredients
          where recipe_id = any($1) order by recipe_id, position",
    )
    .bind(&ids)
    .fetch_all(db)
    .await?;

    let steps: Vec<(Uuid, String)> = sqlx::query_as(
        "select recipe_id, body from steps where recipe_id = any($1) order by recipe_id, position",
    )
    .bind(&ids)
    .fetch_all(db)
    .await?;

    Ok(rows
        .into_iter()
        .map(|row| Recipe {
            ingredients: ingredients
                .iter()
                .filter(|(rid, _, _)| *rid == row.id)
                .map(|(_, qty, name)| Ingredient {
                    qty: qty.clone(),
                    name: name.clone(),
                })
                .collect(),
            steps: steps
                .iter()
                .filter(|(rid, _)| *rid == row.id)
                .map(|(_, body)| body.clone())
                .collect(),
            row,
        })
        .collect())
}

pub async fn list(State(state): State<AppState>) -> AppResult<Json<Vec<Recipe>>> {
    Ok(Json(load_all(&state.db).await?))
}

/// Asking for the recipe as it is being cooked tonight rather than as written.
#[derive(Debug, Deserialize)]
pub struct BatchQuery {
    /// Multiply every quantity by this. Absent or 1 returns the recipe verbatim.
    #[serde(default)]
    pub batch: Option<i16>,
}

pub async fn get_one(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Query(query): Query<BatchQuery>,
) -> AppResult<Json<Recipe>> {
    let mut recipe = load_all(&state.db)
        .await?
        .into_iter()
        .find(|r| r.row.id == id)
        .ok_or(AppError::NotFound("That recipe is not in the library."))?;

    // Scaled here rather than in the browser. The quantity parser is shared
    // with the importers and the shopping merge, and a second implementation in
    // TypeScript is how the amount on the recipe and the amount on the list
    // drift apart — which is exactly the pair that has to agree.
    if let Some(batch) = query.batch.filter(|b| *b > 1) {
        for ingredient in &mut recipe.ingredients {
            ingredient.qty = crate::recipe_import::scale_quantity(&ingredient.qty, batch);
        }
    }

    Ok(Json(recipe))
}

/// `get_one` for callers that only ever want the recipe as written.
async fn get_plain(state: AppState, id: Uuid) -> AppResult<Json<Recipe>> {
    get_one(State(state), Path(id), Query(BatchQuery { batch: None })).await
}

/// Write a draft to the library. Shared by the manual form and both importers.
pub async fn insert_draft(
    tx: &mut Transaction<'_, Postgres>,
    draft: &RecipeDraft,
    source: RecipeSource,
) -> AppResult<Uuid> {
    let title = draft.title.trim();
    if title.is_empty() {
        return Err(AppError::BadRequest("A recipe needs a name.".into()));
    }

    let category_id = super::categories::resolve(tx, &draft.category).await?;

    let id: Uuid = sqlx::query_scalar(
        "insert into recipes
            (title, category_id, time_label, time_minutes, serves_label, blurb, source, source_url)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         returning id",
    )
    .bind(title)
    .bind(category_id)
    .bind(draft.time_label.trim())
    .bind(draft.time_minutes)
    .bind(draft.serves_label.trim())
    .bind(draft.blurb.trim())
    .bind(source)
    .bind(draft.source_url.as_deref())
    .fetch_one(&mut **tx)
    .await?;

    for (position, ingredient) in draft.ingredients.iter().enumerate() {
        if ingredient.name.trim().is_empty() {
            continue;
        }
        sqlx::query(
            "insert into ingredients (recipe_id, position, qty, name) values ($1, $2, $3, $4)",
        )
        .bind(id)
        .bind(position as i32)
        .bind(ingredient.qty.trim())
        .bind(ingredient.name.trim())
        .execute(&mut **tx)
        .await?;
    }

    for (position, step) in draft.steps.iter().enumerate() {
        if step.trim().is_empty() {
            continue;
        }
        sqlx::query("insert into steps (recipe_id, position, body) values ($1, $2, $3)")
            .bind(id)
            .bind(position as i32)
            .bind(step.trim())
            .execute(&mut **tx)
            .await?;
    }

    Ok(id)
}

#[derive(serde::Deserialize)]
pub struct CreateRecipe {
    #[serde(flatten)]
    pub draft: RecipeDraft,
    #[serde(default)]
    pub source: Option<RecipeSource>,
    /// Raw ingredient lines ("500 g potato gnocchi") for the manual form to
    /// send. Splitting them here rather than in the browser keeps one tested
    /// implementation of the quantity parser instead of two that drift.
    #[serde(default)]
    pub ingredient_lines: Option<Vec<String>>,
}

pub async fn create(
    State(state): State<AppState>,
    Json(input): Json<CreateRecipe>,
) -> AppResult<Json<Recipe>> {
    let draft = input.draft.with_lines(input.ingredient_lines);

    let mut tx = state.db.begin().await?;
    let id = insert_draft(&mut tx, &draft, input.source.unwrap_or(RecipeSource::Manual)).await?;
    tx.commit().await?;

    state.bus.publish(Topic::Recipes);
    // A new recipe cannot change the list yet, but the phone's library sheet
    // and the hub's assign panel both read from the same payload.
    get_plain(state, id).await
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(input): Json<CreateRecipe>,
) -> AppResult<Json<Recipe>> {
    let draft = input.draft.with_lines(input.ingredient_lines);
    let mut tx = state.db.begin().await?;

    let category_id = super::categories::resolve(&mut tx, &draft.category).await?;

    let updated = sqlx::query(
        "update recipes
            set title = $2, category_id = $3, time_label = $4, time_minutes = $5,
                serves_label = $6, blurb = $7
          where id = $1",
    )
    .bind(id)
    .bind(draft.title.trim())
    .bind(category_id)
    .bind(draft.time_label.trim())
    .bind(draft.time_minutes)
    .bind(draft.serves_label.trim())
    .bind(draft.blurb.trim())
    .execute(&mut *tx)
    .await?;

    if updated.rows_affected() == 0 {
        return Err(AppError::NotFound("That recipe is not in the library."));
    }

    // Ingredients and steps are positional lists, not entities anyone links to,
    // so replacing them wholesale is simpler than diffing and cannot leave a
    // stale row behind.
    sqlx::query("delete from ingredients where recipe_id = $1")
        .bind(id)
        .execute(&mut *tx)
        .await?;
    sqlx::query("delete from steps where recipe_id = $1")
        .bind(id)
        .execute(&mut *tx)
        .await?;

    for (position, ingredient) in draft.ingredients.iter().enumerate() {
        if ingredient.name.trim().is_empty() {
            continue;
        }
        sqlx::query(
            "insert into ingredients (recipe_id, position, qty, name) values ($1, $2, $3, $4)",
        )
        .bind(id)
        .bind(position as i32)
        .bind(ingredient.qty.trim())
        .bind(ingredient.name.trim())
        .execute(&mut *tx)
        .await?;
    }

    for (position, step) in draft.steps.iter().enumerate() {
        if step.trim().is_empty() {
            continue;
        }
        sqlx::query("insert into steps (recipe_id, position, body) values ($1, $2, $3)")
            .bind(id)
            .bind(position as i32)
            .bind(step.trim())
            .execute(&mut *tx)
            .await?;
    }

    tx.commit().await?;

    // Editing ingredients changes the derived shopping list for any week this
    // recipe is planned in, so both topics move.
    state.bus.publish_all(&[Topic::Recipes, Topic::Shopping]);
    get_plain(state, id).await
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<()>> {
    // plan_entries cascades, so deleting a recipe empties any day it was on.
    sqlx::query("delete from recipes where id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    state
        .bus
        .publish_all(&[Topic::Recipes, Topic::Plan, Topic::Shopping]);
    Ok(Json(()))
}
