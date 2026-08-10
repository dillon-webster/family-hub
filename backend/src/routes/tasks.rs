use axum::Json;
use axum::extract::{Path, State};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::events::Topic;
use crate::models::Task;
use crate::state::AppState;

pub async fn load_all(db: &PgPool) -> AppResult<Vec<Task>> {
    Ok(sqlx::query_as::<_, Task>(
        "select id, title, meta, bucket, done, position
           from tasks
          order by bucket, position, created_at",
    )
    .fetch_all(db)
    .await?)
}

pub async fn list(State(state): State<AppState>) -> AppResult<Json<Vec<Task>>> {
    Ok(Json(load_all(&state.db).await?))
}

#[derive(Deserialize)]
pub struct TaskInput {
    pub title: String,
    #[serde(default)]
    pub meta: String,
    #[serde(default)]
    pub bucket: i16,
}

pub async fn create(
    State(state): State<AppState>,
    Json(input): Json<TaskInput>,
) -> AppResult<Json<Task>> {
    let title = input.title.trim();
    if title.is_empty() {
        return Err(AppError::BadRequest("A task needs a title.".into()));
    }

    let task = sqlx::query_as::<_, Task>(
        "insert into tasks (title, meta, bucket, position)
         values ($1, $2, $3,
                 (select coalesce(max(position), -1) + 1 from tasks where bucket = $3))
         returning id, title, meta, bucket, done, position",
    )
    .bind(title)
    .bind(input.meta.trim())
    .bind(input.bucket.clamp(0, 2))
    .fetch_one(&state.db)
    .await?;

    state.bus.publish(Topic::Tasks);
    Ok(Json(task))
}

#[derive(Deserialize)]
pub struct TaskPatch {
    pub title: Option<String>,
    pub meta: Option<String>,
    pub bucket: Option<i16>,
    pub done: Option<bool>,
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(patch): Json<TaskPatch>,
) -> AppResult<Json<Task>> {
    let task = sqlx::query_as::<_, Task>(
        "update tasks
            set title  = coalesce($2, title),
                meta   = coalesce($3, meta),
                bucket = coalesce($4, bucket),
                done   = coalesce($5, done)
          where id = $1
          returning id, title, meta, bucket, done, position",
    )
    .bind(id)
    .bind(patch.title.as_ref().map(|t| t.trim()))
    .bind(patch.meta.as_ref().map(|m| m.trim()))
    .bind(patch.bucket.map(|b| b.clamp(0, 2)))
    .bind(patch.done)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound("No such task."))?;

    state.bus.publish(Topic::Tasks);
    Ok(Json(task))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<()>> {
    sqlx::query("delete from tasks where id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    state.bus.publish(Topic::Tasks);
    Ok(Json(()))
}
