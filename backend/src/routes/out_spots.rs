use axum::Json;
use axum::extract::{Path, State};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::events::Topic;
use crate::models::OutSpot;
use crate::state::AppState;

pub async fn load_all(db: &PgPool) -> AppResult<Vec<OutSpot>> {
    Ok(
        sqlx::query_as::<_, OutSpot>("select id, name, position from out_spots order by position")
            .fetch_all(db)
            .await?,
    )
}

pub async fn list(State(state): State<AppState>) -> AppResult<Json<Vec<OutSpot>>> {
    Ok(Json(load_all(&state.db).await?))
}

#[derive(Deserialize)]
pub struct SpotInput {
    pub name: String,
}

pub async fn create(
    State(state): State<AppState>,
    Json(input): Json<SpotInput>,
) -> AppResult<Json<OutSpot>> {
    let name = input.name.trim();
    if name.is_empty() {
        return Err(AppError::BadRequest("A spot needs a name.".into()));
    }

    // Re-adding a place the household already goes to should be a no-op, not
    // a duplicate chip.
    let spot = sqlx::query_as::<_, OutSpot>(
        "insert into out_spots (name, position)
         values ($1, (select coalesce(max(position), -1) + 1 from out_spots))
         on conflict (name) do update set name = excluded.name
         returning id, name, position",
    )
    .bind(name)
    .fetch_one(&state.db)
    .await?;

    state.bus.publish(Topic::OutSpots);
    Ok(Json(spot))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<()>> {
    sqlx::query("delete from out_spots where id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    state.bus.publish(Topic::OutSpots);
    Ok(Json(()))
}
