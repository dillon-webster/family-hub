use axum::Json;
use axum::extract::{Path, Query, State};
use chrono::{DateTime, Utc};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::events::Topic;
use crate::ics;
use crate::models::{CalendarEvent, CalendarFeedPublic};
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct RangeQuery {
    pub from: DateTime<Utc>,
    pub to: DateTime<Utc>,
}

pub async fn load_range(
    db: &PgPool,
    from: DateTime<Utc>,
    to: DateTime<Utc>,
) -> AppResult<Vec<CalendarEvent>> {
    Ok(sqlx::query_as::<_, CalendarEvent>(
        "select id, title, starts_at, ends_at, all_day, member_id, feed_id
           from calendar_events
          where starts_at >= $1 and starts_at < $2
          order by starts_at",
    )
    .bind(from)
    .bind(to)
    .fetch_all(db)
    .await?)
}

pub async fn list(
    State(state): State<AppState>,
    Query(range): Query<RangeQuery>,
) -> AppResult<Json<Vec<CalendarEvent>>> {
    Ok(Json(load_range(&state.db, range.from, range.to).await?))
}

#[derive(Debug, Deserialize)]
pub struct EventInput {
    pub title: String,
    pub starts_at: DateTime<Utc>,
    #[serde(default)]
    pub ends_at: Option<DateTime<Utc>>,
    #[serde(default)]
    pub all_day: bool,
    #[serde(default)]
    pub member_id: Option<Uuid>,
}

pub async fn create_event(
    State(state): State<AppState>,
    Json(input): Json<EventInput>,
) -> AppResult<Json<CalendarEvent>> {
    let title = input.title.trim();
    if title.is_empty() {
        return Err(AppError::BadRequest("An event needs a title.".into()));
    }

    let event = sqlx::query_as::<_, CalendarEvent>(
        "insert into calendar_events (title, starts_at, ends_at, all_day, member_id)
         values ($1, $2, $3, $4, $5)
         returning id, title, starts_at, ends_at, all_day, member_id, feed_id",
    )
    .bind(title)
    .bind(input.starts_at)
    .bind(input.ends_at)
    .bind(input.all_day)
    .bind(input.member_id)
    .fetch_one(&state.db)
    .await?;

    state.bus.publish(Topic::Calendar);
    Ok(Json(event))
}

#[derive(Debug, Deserialize)]
pub struct EventPatch {
    pub title: Option<String>,
    pub starts_at: Option<DateTime<Utc>>,
    pub ends_at: Option<DateTime<Utc>>,
    pub all_day: Option<bool>,
    pub member_id: Option<Uuid>,
}

pub async fn update_event(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(patch): Json<EventPatch>,
) -> AppResult<Json<CalendarEvent>> {
    // Feed-backed events are replaced wholesale on every sync, so an edit here
    // would silently vanish. Refuse it rather than lose someone's change.
    let event = sqlx::query_as::<_, CalendarEvent>(
        "update calendar_events
            set title     = coalesce($2, title),
                starts_at = coalesce($3, starts_at),
                ends_at   = coalesce($4, ends_at),
                all_day   = coalesce($5, all_day),
                member_id = coalesce($6, member_id)
          where id = $1 and feed_id is null
          returning id, title, starts_at, ends_at, all_day, member_id, feed_id",
    )
    .bind(id)
    .bind(patch.title.as_ref().map(|t| t.trim()))
    .bind(patch.starts_at)
    .bind(patch.ends_at)
    .bind(patch.all_day)
    .bind(patch.member_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::BadRequest(
        "That event comes from a subscribed calendar and can only be changed there.".into(),
    ))?;

    state.bus.publish(Topic::Calendar);
    Ok(Json(event))
}

pub async fn delete_event(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<()>> {
    let deleted = sqlx::query("delete from calendar_events where id = $1 and feed_id is null")
        .bind(id)
        .execute(&state.db)
        .await?;

    if deleted.rows_affected() == 0 {
        return Err(AppError::BadRequest(
            "That event comes from a subscribed calendar and can only be removed there.".into(),
        ));
    }

    state.bus.publish(Topic::Calendar);
    Ok(Json(()))
}

// ------------------------------------------------------------------- feeds --

pub async fn load_feeds(db: &PgPool) -> AppResult<Vec<CalendarFeedPublic>> {
    Ok(sqlx::query_as::<_, CalendarFeedPublic>(
        "select id, name, member_id, color, enabled, last_synced_at, last_error
           from calendar_feeds
          order by created_at",
    )
    .fetch_all(db)
    .await?)
}

pub async fn list_feeds(
    State(state): State<AppState>,
) -> AppResult<Json<Vec<CalendarFeedPublic>>> {
    Ok(Json(load_feeds(&state.db).await?))
}

#[derive(Debug, Deserialize)]
pub struct FeedInput {
    pub name: String,
    pub url: String,
    #[serde(default)]
    pub member_id: Option<Uuid>,
    #[serde(default)]
    pub color: Option<String>,
}

pub async fn create_feed(
    State(state): State<AppState>,
    Json(input): Json<FeedInput>,
) -> AppResult<Json<CalendarFeedPublic>> {
    let url = input.url.trim();
    if !(url.starts_with("http://") || url.starts_with("https://") || url.starts_with("webcal://"))
    {
        return Err(AppError::BadRequest(
            "That does not look like a calendar address.".into(),
        ));
    }

    let id: Uuid = sqlx::query_scalar(
        "insert into calendar_feeds (name, url, member_id, color) values ($1, $2, $3, $4)
         returning id",
    )
    .bind(input.name.trim())
    .bind(url)
    .bind(input.member_id)
    .bind(input.color)
    .fetch_one(&state.db)
    .await?;

    // Pull it immediately so the calendar is populated before anyone looks,
    // but do not fail the request if the feed is unreachable — the row exists
    // and `last_error` will explain.
    if let Err(err) = ics::sync_feed(&state.db, &state.http, id).await {
        tracing::warn!(error = %err, "first sync of new feed failed");
    }

    state.bus.publish(Topic::Calendar);

    load_feeds(&state.db)
        .await?
        .into_iter()
        .find(|f| f.id == id)
        .map(Json)
        .ok_or(AppError::NotFound("Feed disappeared."))
}

pub async fn delete_feed(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<()>> {
    // calendar_events cascades on feed_id, so its mirrored events go with it.
    sqlx::query("delete from calendar_feeds where id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    state.bus.publish(Topic::Calendar);
    Ok(Json(()))
}

#[derive(Debug, serde::Serialize)]
pub struct SyncReport {
    pub events: usize,
}

pub async fn sync_feeds(State(state): State<AppState>) -> AppResult<Json<SyncReport>> {
    let events = ics::sync_all(&state.db, &state.http)
        .await
        .map_err(|e| AppError::Upstream(e.to_string()))?;

    state.bus.publish(Topic::Calendar);
    Ok(Json(SyncReport { events }))
}
