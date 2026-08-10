use axum::Json;
use axum::extract::{Path, State};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::events::Topic;
use crate::models::Member;
use crate::state::AppState;

/// Create the household from `FAMILY_HUB_MEMBERS` the first time the hub runs.
///
/// Only ever fires against an empty table, so renaming someone later is a
/// database edit or an API call, not a matter of restarting with a different
/// environment variable.
pub async fn ensure_seeded(db: &PgPool, spec: &str) -> anyhow::Result<()> {
    let existing: i64 = sqlx::query_scalar("select count(*) from members")
        .fetch_one(db)
        .await?;
    if existing > 0 {
        return Ok(());
    }

    for (position, entry) in spec.split(',').filter(|e| !e.trim().is_empty()).enumerate() {
        let (name, color) = entry
            .split_once(':')
            .map(|(n, c)| (n.trim(), c.trim()))
            // Falling back to the brand terracotta keeps a malformed entry from
            // stopping the hub from booting.
            .unwrap_or((entry.trim(), "#C8553D"));

        let initial = name
            .chars()
            .next()
            .map(|c| c.to_uppercase().to_string())
            .unwrap_or_else(|| "?".into());

        sqlx::query(
            "insert into members (name, initial, color, position) values ($1, $2, $3, $4)",
        )
        .bind(name)
        .bind(&initial)
        .bind(color)
        .bind(position as i32)
        .execute(db)
        .await?;

        tracing::info!(%name, %color, "seeded household member");
    }

    Ok(())
}

pub async fn list(db: &PgPool) -> AppResult<Vec<Member>> {
    Ok(sqlx::query_as::<_, Member>(
        "select id, name, initial, color, position from members order by position, name",
    )
    .fetch_all(db)
    .await?)
}

pub async fn get_all(State(state): State<AppState>) -> AppResult<Json<Vec<Member>>> {
    Ok(Json(list(&state.db).await?))
}

#[derive(Deserialize)]
pub struct MemberInput {
    pub name: String,
    pub color: Option<String>,
}

pub async fn create(
    State(state): State<AppState>,
    Json(input): Json<MemberInput>,
) -> AppResult<Json<Member>> {
    let name = input.name.trim();
    if name.is_empty() {
        return Err(AppError::BadRequest("A member needs a name.".into()));
    }
    let initial = name.chars().next().unwrap().to_uppercase().to_string();

    let member = sqlx::query_as::<_, Member>(
        "insert into members (name, initial, color, position)
         values ($1, $2, $3, (select coalesce(max(position), -1) + 1 from members))
         returning id, name, initial, color, position",
    )
    .bind(name)
    .bind(initial)
    .bind(input.color.unwrap_or_else(|| "#4F7CA0".into()))
    .fetch_one(&state.db)
    .await?;

    state.bus.publish(Topic::Members);
    Ok(Json(member))
}

#[derive(Deserialize)]
pub struct MemberPatch {
    pub name: Option<String>,
    pub color: Option<String>,
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(patch): Json<MemberPatch>,
) -> AppResult<Json<Member>> {
    let initial = patch
        .name
        .as_ref()
        .and_then(|n| n.trim().chars().next())
        .map(|c| c.to_uppercase().to_string());

    let member = sqlx::query_as::<_, Member>(
        "update members
            set name    = coalesce($2, name),
                initial = coalesce($3, initial),
                color   = coalesce($4, color)
          where id = $1
          returning id, name, initial, color, position",
    )
    .bind(id)
    .bind(patch.name.as_ref().map(|n| n.trim()))
    .bind(initial)
    .bind(patch.color)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound("No such member."))?;

    state.bus.publish(Topic::Members);
    Ok(Json(member))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<()>> {
    sqlx::query("delete from members where id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;
    state.bus.publish(Topic::Members);
    Ok(Json(()))
}
