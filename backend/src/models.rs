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

/// A category as the household defined it, carrying the gradient that stands in
/// for a photograph on every card in that category.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct RecipeCategory {
    pub id: Uuid,
    pub name: String,
    pub color_from: String,
    pub color_to: String,
    pub position: i32,
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
    pub category_id: Uuid,
    /// The category's name, joined on read. The surfaces key their gradient
    /// lookup off this rather than the id, so it stays on the wire.
    pub category: String,
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
    /// The category by *name*, not id. The two importers guess a name from
    /// whatever the source called it, and the forms send back the name the
    /// household typed; both are resolved against `recipe_categories` on write,
    /// falling back to the first category when nothing matches.
    pub category: String,
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

impl RecipeDraft {
    /// Fill in `ingredients` from raw typed lines ("500 g potato gnocchi").
    ///
    /// Both forms on both surfaces send lines rather than split pairs, so the
    /// amount is separated from the name by the same parser the link importer
    /// uses. Structured `ingredients` win when both are present, which is how
    /// an import preview keeps the exact quantities it read.
    pub fn with_lines(mut self, lines: Option<Vec<String>>) -> Self {
        if let Some(lines) = lines {
            if self.ingredients.is_empty() {
                self.ingredients = lines
                    .iter()
                    .map(|line| line.trim())
                    .filter(|line| !line.is_empty())
                    .map(crate::recipe_import::split_quantity)
                    .collect();
            }
        }
        self
    }
}

// --------------------------------------------------------------- week plan --

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "plan_kind", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum PlanKind {
    Cook,
    Out,
    /// Counts as planned, contributes nothing to the list — the same bargain
    /// eating out makes, for the night the fridge is dinner.
    Leftovers,
}

/// Which meal on the day. Dinner is the plan's spine; lunch exists for the prep
/// cook, so a batch of something made on Sunday can put its ingredients on the
/// same shopping list as the week's dinners.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "meal_slot", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum MealSlot {
    Dinner,
    Lunch,
}

impl Default for MealSlot {
    fn default() -> Self {
        Self::Dinner
    }
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct PlanEntry {
    pub day: NaiveDate,
    pub slot: MealSlot,
    pub kind: PlanKind,
    pub recipe_id: Option<Uuid>,
    /// `None` with `kind = Out` renders as the generic "Eating out".
    pub out_place: Option<String>,
    /// How many times over the recipe is being made. 1 unless someone ticked
    /// the double batch, and the shopping list multiplies by it.
    pub batch: i16,
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
