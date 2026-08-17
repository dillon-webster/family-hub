pub mod calendar;
pub mod categories;
pub mod import;
pub mod members;
pub mod out_spots;
pub mod plan;
pub mod recipes;
pub mod shopping;
pub mod stream;
pub mod tasks;

use axum::Json;
use axum::extract::{Query, State};
use axum::routing::{delete, get, patch, post, put};
use axum::{Router, http::StatusCode};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};

use crate::error::AppResult;
use crate::models::{CalendarEvent, Member, OutSpot, PlanEntry, Recipe, RecipeCategory, Task};
use crate::shopping::Aisle;
use crate::state::AppState;

/// Everything the hub needs to draw itself, in one request.
///
/// The surfaces open cold on a kitchen wall and on a phone in a shop aisle;
/// one round trip beats seven, and the SSE stream keeps it current afterwards.
#[derive(Debug, Serialize)]
pub struct Bootstrap {
    pub members: Vec<Member>,
    pub recipes: Vec<Recipe>,
    /// The household's categories, with the gradient each one paints its cards
    /// with. Sent here rather than hard-coded in the frontend, which is what
    /// made the set closed in the first place.
    pub categories: Vec<RecipeCategory>,
    pub plan: Vec<PlanEntry>,
    pub shopping: shopping::ShoppingList,
    pub events: Vec<CalendarEvent>,
    pub tasks: Vec<Task>,
    pub out_spots: Vec<OutSpot>,
    pub aisles: Vec<AisleInfo>,
    pub scanning_enabled: bool,
}

/// The aisle palette, sent rather than duplicated in the frontend so the two
/// surfaces cannot drift from the shopping engine's own grouping.
#[derive(Debug, Serialize)]
pub struct AisleInfo {
    pub aisle: Aisle,
    pub label: &'static str,
    pub hub_color: &'static str,
    pub phone_color: &'static str,
}

#[derive(Debug, Deserialize)]
pub struct BootstrapQuery {
    /// Monday of the week being shown, as the client's own calendar sees it.
    pub week_start: chrono::NaiveDate,
    /// Window for calendar events; defaults to the same week.
    #[serde(default)]
    pub from: Option<DateTime<Utc>>,
    #[serde(default)]
    pub to: Option<DateTime<Utc>>,
}

pub async fn bootstrap(
    State(state): State<AppState>,
    Query(query): Query<BootstrapQuery>,
) -> AppResult<Json<Bootstrap>> {
    let week_end = query.week_start + Duration::days(6);

    // The plan comes back much wider than the week on screen, for two reasons.
    // Home's "rest of the week" looks four days past today, which spills into
    // next week from Thursday onward — fetching only Mon–Sun would leave those
    // cards saying "nothing planned yet" for dinners that are, in fact,
    // planned. And the meal plan is a strip you scroll rather than a week you
    // page, so days well either side of the anchor are on screen the moment
    // someone flicks it. Narrowing this is how planned dinners silently turn
    // into empty nights.
    let plan_from = query.week_start - Duration::days(21);
    let plan_to = query.week_start + Duration::days(27);

    // A generous default window: the client filters to the day columns it is
    // drawing, and this covers every timezone the house could be in.
    let from = query.from.unwrap_or_else(|| {
        query
            .week_start
            .and_hms_opt(0, 0, 0)
            .unwrap()
            .and_utc()
            - Duration::days(1)
    });
    let to = query.to.unwrap_or_else(|| {
        week_end.and_hms_opt(23, 59, 59).unwrap().and_utc() + Duration::days(1)
    });

    Ok(Json(Bootstrap {
        members: members::list(&state.db).await?,
        recipes: recipes::load_all(&state.db).await?,
        categories: categories::load_all(&state.db).await?,
        plan: plan::load_range(&state.db, plan_from, plan_to).await?,
        shopping: shopping::build_for_week(&state.db, query.week_start).await?,
        events: calendar::load_range(&state.db, from, to).await?,
        tasks: tasks::load_all(&state.db).await?,
        out_spots: out_spots::load_all(&state.db).await?,
        aisles: Aisle::ORDER
            .into_iter()
            .map(|aisle| AisleInfo {
                aisle,
                label: aisle.label(),
                hub_color: aisle.hub_color(),
                phone_color: aisle.phone_color(),
            })
            .collect(),
        scanning_enabled: state.config.anthropic_api_key.is_some(),
    }))
}

/// Liveness for the container healthcheck. Touches the database, because a hub
/// that cannot reach Postgres is not healthy however well it serves HTML.
pub async fn health(State(state): State<AppState>) -> (StatusCode, Json<serde_json::Value>) {
    match sqlx::query_scalar::<_, i32>("select 1")
        .fetch_one(&state.db)
        .await
    {
        Ok(_) => (
            StatusCode::OK,
            Json(serde_json::json!({ "status": "ok" })),
        ),
        Err(err) => {
            tracing::error!(error = ?err, "health check failed");
            (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(serde_json::json!({ "status": "database unavailable" })),
            )
        }
    }
}

pub fn api_router() -> Router<AppState> {
    Router::new()
        .route("/health", get(health))
        .route("/bootstrap", get(bootstrap))
        .route("/events", get(stream::subscribe))
        // members
        .route("/members", get(members::get_all).post(members::create))
        .route(
            "/members/{id}",
            patch(members::update).delete(members::delete),
        )
        // recipe categories
        .route(
            "/categories",
            get(categories::list).post(categories::create),
        )
        .route(
            "/categories/{id}",
            patch(categories::update).delete(categories::delete),
        )
        // recipes
        .route("/recipes", get(recipes::list).post(recipes::create))
        .route(
            "/recipes/{id}",
            get(recipes::get_one)
                .put(recipes::update)
                .delete(recipes::delete),
        )
        // week plan
        .route("/plan", get(plan::get_week))
        .route("/plan/{day}", put(plan::set_day).delete(plan::clear_day))
        // shopping
        .route("/shopping", get(shopping::get))
        .route("/shopping/item", patch(shopping::patch_item))
        .route("/shopping/approve", post(shopping::approve))
        .route("/shopping/unapprove", post(shopping::unapprove))
        .route("/shopping/extras", post(shopping::add_extra))
        .route("/shopping/extras/{id}", delete(shopping::delete_extra))
        // calendar
        .route(
            "/calendar/events",
            get(calendar::list).post(calendar::create_event),
        )
        .route(
            "/calendar/events/{id}",
            patch(calendar::update_event).delete(calendar::delete_event),
        )
        .route(
            "/calendar/feeds",
            get(calendar::list_feeds).post(calendar::create_feed),
        )
        .route("/calendar/feeds/{id}", delete(calendar::delete_feed))
        .route("/calendar/sync", post(calendar::sync_feeds))
        // tasks
        .route("/tasks", get(tasks::list).post(tasks::create))
        .route("/tasks/{id}", patch(tasks::update).delete(tasks::delete))
        // frequent spots
        .route("/out-spots", get(out_spots::list).post(out_spots::create))
        .route("/out-spots/{id}", delete(out_spots::delete))
        // recipe import
        .route("/import/status", get(import::status))
        .route("/import/link", post(import::from_link))
        .route("/import/scan", post(import::from_scan))
}
