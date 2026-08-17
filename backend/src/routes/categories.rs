//! The household's recipe categories.
//!
//! Every recipe is drawn as a colour field rather than a photograph, so a
//! category is not just a label — it owns the two-stop gradient that makes one
//! card distinguishable from another across a kitchen. Creating one means
//! choosing those colours, which is why they are required rather than
//! generated.

use axum::Json;
use axum::extract::{Path, State};
use serde::Deserialize;
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::events::Topic;
use crate::models::RecipeCategory;
use crate::state::AppState;

pub async fn load_all(db: &PgPool) -> AppResult<Vec<RecipeCategory>> {
    Ok(sqlx::query_as::<_, RecipeCategory>(
        "select id, name, color_from, color_to, position
           from recipe_categories
          order by position, name",
    )
    .fetch_all(db)
    .await?)
}

pub async fn list(State(state): State<AppState>) -> AppResult<Json<Vec<RecipeCategory>>> {
    Ok(Json(load_all(&state.db).await?))
}

/// Resolve a category *name* to its id, for the importers and the forms.
///
/// Matching is case-insensitive and trimmed because the name arrives from three
/// places that disagree about capitalisation: a recipe site's `recipeCategory`,
/// Claude's reading of a photographed page, and someone typing on an iPad.
/// Nothing matching falls back to the first category rather than failing — an
/// import that got the category wrong is fixable in two taps, an import that
/// refused to save is a lost recipe.
pub async fn resolve(tx: &mut Transaction<'_, Postgres>, name: &str) -> AppResult<Uuid> {
    let trimmed = name.trim();

    if !trimmed.is_empty() {
        let found: Option<Uuid> =
            sqlx::query_scalar("select id from recipe_categories where lower(name) = lower($1)")
                .bind(trimmed)
                .fetch_optional(&mut **tx)
                .await?;
        if let Some(id) = found {
            return Ok(id);
        }
    }

    sqlx::query_scalar("select id from recipe_categories order by position, name limit 1")
        .fetch_optional(&mut **tx)
        .await?
        .ok_or(AppError::BadRequest(
            "There are no recipe categories yet. Add one before saving a recipe.".into(),
        ))
}

#[derive(Debug, Deserialize)]
pub struct CategoryInput {
    pub name: String,
    pub color_from: String,
    pub color_to: String,
    #[serde(default)]
    pub position: Option<i32>,
}

/// Hex, because that is what the colour input on both surfaces produces and
/// what the gradient is interpolated from. Anything else would reach the
/// browser as an invalid `linear-gradient` and render as nothing at all —
/// a card with no field, which reads as a broken recipe rather than a bad
/// colour.
fn check_hex(value: &str) -> AppResult<String> {
    let trimmed = value.trim();
    let ok = trimmed.len() == 7
        && trimmed.starts_with('#')
        && trimmed[1..].chars().all(|c| c.is_ascii_hexdigit());

    if ok {
        Ok(trimmed.to_uppercase())
    } else {
        Err(AppError::BadRequest(
            "A colour needs to look like #C8553D.".into(),
        ))
    }
}

fn check_name(value: &str) -> AppResult<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Err(AppError::BadRequest("A category needs a name.".into()));
    }
    if trimmed.chars().count() > 24 {
        // The name is rendered as an overline on a recipe card and as a filter
        // chip; past this it wraps and pushes the title off the tile.
        return Err(AppError::BadRequest(
            "That name is too long for a recipe card — 24 characters at most.".into(),
        ));
    }
    Ok(trimmed.to_string())
}

pub async fn create(
    State(state): State<AppState>,
    Json(input): Json<CategoryInput>,
) -> AppResult<Json<RecipeCategory>> {
    let name = check_name(&input.name)?;
    let from = check_hex(&input.color_from)?;
    let to = check_hex(&input.color_to)?;

    let taken: bool =
        sqlx::query_scalar("select exists(select 1 from recipe_categories where lower(name) = lower($1))")
            .bind(&name)
            .fetch_one(&state.db)
            .await?;
    if taken {
        return Err(AppError::BadRequest(format!(
            "There is already a category called {name}."
        )));
    }

    // Append by default, so a new category lands after the ones already there
    // rather than silently sharing position 0 and sorting by name.
    let position = match input.position {
        Some(value) => value,
        None => sqlx::query_scalar::<_, Option<i32>>(
            "select max(position) from recipe_categories",
        )
        .fetch_one(&state.db)
        .await?
        .map_or(0, |max| max + 1),
    };

    let created = sqlx::query_as::<_, RecipeCategory>(
        "insert into recipe_categories (name, color_from, color_to, position)
         values ($1, $2, $3, $4)
         returning id, name, color_from, color_to, position",
    )
    .bind(&name)
    .bind(&from)
    .bind(&to)
    .bind(position)
    .fetch_one(&state.db)
    .await?;

    state.bus.publish(Topic::Recipes);
    Ok(Json(created))
}

#[derive(Debug, Deserialize)]
pub struct CategoryPatch {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub color_from: Option<String>,
    #[serde(default)]
    pub color_to: Option<String>,
    #[serde(default)]
    pub position: Option<i32>,
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(patch): Json<CategoryPatch>,
) -> AppResult<Json<RecipeCategory>> {
    let name = patch.name.as_deref().map(check_name).transpose()?;
    let from = patch.color_from.as_deref().map(check_hex).transpose()?;
    let to = patch.color_to.as_deref().map(check_hex).transpose()?;

    if let Some(name) = &name {
        let taken: bool = sqlx::query_scalar(
            "select exists(select 1 from recipe_categories
                            where lower(name) = lower($1) and id <> $2)",
        )
        .bind(name)
        .bind(id)
        .fetch_one(&state.db)
        .await?;
        if taken {
            return Err(AppError::BadRequest(format!(
                "There is already a category called {name}."
            )));
        }
    }

    let updated = sqlx::query_as::<_, RecipeCategory>(
        "update recipe_categories
            set name       = coalesce($2, name),
                color_from = coalesce($3, color_from),
                color_to   = coalesce($4, color_to),
                position   = coalesce($5, position)
          where id = $1
      returning id, name, color_from, color_to, position",
    )
    .bind(id)
    .bind(name)
    .bind(from)
    .bind(to)
    .bind(patch.position)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound("That category no longer exists."))?;

    // Recolouring a category repaints every card in it, on both surfaces.
    state.bus.publish(Topic::Recipes);
    Ok(Json(updated))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<()>> {
    // The foreign key is `on delete restrict`, so the database would refuse
    // this anyway. Counting first turns a constraint violation into a sentence
    // that says what to do about it.
    let in_use: i64 = sqlx::query_scalar("select count(*) from recipes where category_id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await?;

    if in_use > 0 {
        return Err(AppError::BadRequest(format!(
            "{in_use} recipe{} still in that category. Move {} first.",
            if in_use == 1 { " is" } else { "s are" },
            if in_use == 1 { "it" } else { "them" },
        )));
    }

    let last: i64 = sqlx::query_scalar("select count(*) from recipe_categories")
        .fetch_one(&state.db)
        .await?;
    if last <= 1 {
        return Err(AppError::BadRequest(
            "Every recipe needs a category — keep at least one.".into(),
        ));
    }

    sqlx::query("delete from recipe_categories where id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    state.bus.publish(Topic::Recipes);
    Ok(Json(()))
}
