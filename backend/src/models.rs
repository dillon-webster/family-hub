use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ------------------------------------------------------------------ members --

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct Member {
    pub id: Uuid,
    pub name: String,
    pub initial: String,
    pub color: String,
    pub position: i32,
}

// ------------------------------------------------------------------ recipes --

/// Mirrors the `recipe_category` Postgres enum. Each variant owns a gradient in
/// the design system, so the set is closed on purpose.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "recipe_category")]
pub enum Category {
    Dinner,
    Breakfast,
    Vegetarian,
    Dessert,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "recipe_source", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum RecipeSource {
    Manual,
    Link,
    Scan,
    Seed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ingredient {
    /// Empty for things like "salt and pepper". Ingredients without a quantity
    /// are deliberately left off the shopping list.
    pub qty: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct RecipeRow {
    pub id: Uuid,
    pub title: String,
    pub category: Category,
    pub time_label: String,
    pub time_minutes: Option<i32>,
    pub serves_label: String,
    pub blurb: String,
    pub source: RecipeSource,
    pub source_url: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize)]
pub struct Recipe {
    #[serde(flatten)]
    pub row: RecipeRow,
    pub ingredients: Vec<Ingredient>,
    pub steps: Vec<String>,
}

/// The shape both the manual form and the two importers produce, and the only
/// shape that can be written to the library.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecipeDraft {
    pub title: String,
    pub category: Category,
    pub time_label: String,
    #[serde(default)]
    pub time_minutes: Option<i32>,
    #[serde(default)]
    pub serves_label: String,
    #[serde(default)]
    pub blurb: String,
    #[serde(default)]
    pub ingredients: Vec<Ingredient>,
    #[serde(default)]
    pub steps: Vec<String>,
    #[serde(default)]
    pub source_url: Option<String>,
}

// --------------------------------------------------------------- week plan --

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "plan_kind", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum PlanKind {
    Cook,
    Out,
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct PlanEntry {
    pub day: NaiveDate,
    pub kind: PlanKind,
    pub recipe_id: Option<Uuid>,
    /// `None` with `kind = Out` renders as the generic "Eating out".
    pub out_place: Option<String>,
}

// ---------------------------------------------------------------- calendar --

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct CalendarEvent {
    pub id: Uuid,
    pub title: String,
    pub starts_at: DateTime<Utc>,
    pub ends_at: Option<DateTime<Utc>>,
    pub all_day: bool,
    pub member_id: Option<Uuid>,
    /// Present means the event came from an ICS feed and is read-only.
    pub feed_id: Option<Uuid>,
}

/// Feeds as the browser sees them — note the absence of `url`, which is a
/// secret token for most calendar providers and never leaves the server.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct CalendarFeedPublic {
    pub id: Uuid,
    pub name: String,
    pub member_id: Option<Uuid>,
    pub color: Option<String>,
    pub enabled: bool,
    pub last_synced_at: Option<DateTime<Utc>>,
    pub last_error: Option<String>,
}

// ------------------------------------------------------------------- tasks --

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct Task {
    pub id: Uuid,
    pub title: String,
    pub meta: String,
    pub bucket: i16,
    pub done: bool,
    pub position: i32,
}

// --------------------------------------------------------------- out spots --

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct OutSpot {
    pub id: Uuid,
    pub name: String,
    pub position: i32,
}
