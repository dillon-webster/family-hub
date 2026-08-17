/** Wire types, mirroring the Rust models exactly. */

/** A category name. Open — the household defines its own, so this is a plain
 *  string and the gradient for it is looked up from `Bootstrap.categories`. */
export type Category = string;
export type AisleKey = 'produce' | 'meat' | 'cold' | 'pantry' | 'misc';

/** A category as the household defined it, carrying the gradient its cards are
 *  painted with. There is no photography in this product, so these two colours
 *  are the only thing distinguishing one recipe card from another. */
export interface RecipeCategory {
  id: string;
  name: string;
  color_from: string;
  color_to: string;
  position: number;
}

/** Which meal on a day. Dinner is the plan's spine; lunch is the prep cook. */
export type MealSlot = 'dinner' | 'lunch';

export interface Member {
  id: string;
  name: string;
  initial: string;
  color: string;
  position: number;
}

export interface Ingredient {
  /** Empty for things listed without an amount. Those stay off the list. */
  qty: string;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  category_id: string;
  /** The category's name, joined server-side. */
  category: Category;
  time_label: string;
  time_minutes: number | null;
  serves_label: string;
  blurb: string;
  source: 'manual' | 'link' | 'scan' | 'seed';
  source_url: string | null;
  created_at: string;
  ingredients: Ingredient[];
  steps: string[];
}

/** What a recipe looks like before it is saved to the library. */
export interface RecipeDraft {
  title: string;
  category: Category;
  time_label: string;
  time_minutes?: number | null;
  serves_label: string;
  blurb: string;
  ingredients: Ingredient[];
  steps: string[];
  source_url?: string | null;
  /** Raw typed lines ("500 g potato gnocchi"). The server splits the amount
   *  from the name, so the browser never parses a quantity. Ignored when
   *  `ingredients` is non-empty, which is how an import keeps what it read. */
  ingredient_lines?: string[];
}

export interface ImportPreview extends RecipeDraft {
  /** How it was read: from page metadata, from page text, or from a photo. */
  method: 'structured' | 'read' | 'scan';
}

export interface PlanEntry {
  /** ISO date, `YYYY-MM-DD`. */
  day: string;
  slot: MealSlot;
  /** `leftovers` counts as planned and contributes nothing to the shopping
   *  list — the same bargain `out` makes. */
  kind: 'cook' | 'out' | 'leftovers';
  recipe_id: string | null;
  /** Null with kind `out` renders as the generic "Eating out". */
  out_place: string | null;
  /** How many times over the recipe is being made. 1 unless someone ticked the
   *  double batch, in which case the shopping list has already multiplied. */
  batch: number;
}

export interface ListItem {
  key: string;
  name: string;
  qtys: string[];
  meals: number;
  aisle: AisleKey;
  /** Typed in at the shop rather than derived from a recipe. */
  hand: boolean;
  bought: boolean;
  skipped: boolean;
  sources: string[];
  added_by: string | null;
}

export interface AisleGroup {
  aisle: AisleKey;
  label: string;
  hub_color: string;
  phone_color: string;
  items: ListItem[];
}

export interface ShoppingList {
  week_start: string;
  /** False until the generated items have been reviewed. */
  approved: boolean;
  groups: AisleGroup[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  member_id: string | null;
  /** Present means it came from a subscribed calendar and is read-only. */
  feed_id: string | null;
}

export interface CalendarFeed {
  id: string;
  name: string;
  member_id: string | null;
  color: string | null;
  enabled: boolean;
  last_synced_at: string | null;
  last_error: string | null;
}

export interface Task {
  id: string;
  title: string;
  meta: string;
  /** 0 short-term, 1 medium, 2 long — the board's three columns. */
  bucket: number;
  done: boolean;
  position: number;
}

export interface OutSpot {
  id: string;
  name: string;
  position: number;
}

export interface AisleInfo {
  aisle: AisleKey;
  label: string;
  hub_color: string;
  phone_color: string;
}

export interface Bootstrap {
  members: Member[];
  recipes: Recipe[];
  categories: RecipeCategory[];
  plan: PlanEntry[];
  shopping: ShoppingList;
  events: CalendarEvent[];
  tasks: Task[];
  out_spots: OutSpot[];
  aisles: AisleInfo[];
  /** False when no API key is configured; the scan route says so up front. */
  scanning_enabled: boolean;
}

/** Topics the server pushes over SSE. A client refetches what moved. */
export type Topic =
  | 'plan'
  | 'recipes'
  | 'shopping'
  | 'calendar'
  | 'tasks'
  | 'members'
  | 'out-spots'
  | 'refresh';
