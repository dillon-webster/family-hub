import type {
  Bootstrap,
  CalendarEvent,
  CalendarFeed,
  ImportPreview,
  MealSlot,
  Member,
  OutSpot,
  PlanEntry,
  Recipe,
  RecipeCategory,
  RecipeDraft,
  ShoppingList,
  Task,
} from './types';

const BASE = '/api';

/** An API failure carrying the server's own sentence, which is written for
 *  someone standing at the counter rather than for a log file. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
  });

  if (!response.ok) {
    let message = `Something went wrong (${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body?.error === 'string') message = body.error;
    } catch {
      // A non-JSON error body means the message above is the best we have.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

/** Dinner is the default on the server, so it is left off the wire entirely. */
const slotQuery = (slot?: MealSlot) => (slot && slot !== 'dinner' ? `?slot=${slot}` : '');

export const api = {
  bootstrap: (weekStart: string) =>
    request<Bootstrap>(`/bootstrap?week_start=${weekStart}`),

  // ---- week plan ----------------------------------------------------------
  /**
   * Assign a recipe to a meal. `batch` is how many times over it is being made
   * — the server multiplies the ingredients before they reach the list, so
   * nothing downstream has to know about doubling.
   */
  cook: (day: string, recipeId: string, options?: { batch?: number; slot?: MealSlot }) =>
    request<unknown>(`/plan/${day}${slotQuery(options?.slot)}`, {
      method: 'PUT',
      ...json({ recipe_id: recipeId, batch: options?.batch ?? 1 }),
    }),

  /** Mark a meal as eating out, optionally at a named spot. */
  eatOut: (day: string, place?: string, slot?: MealSlot) =>
    request<unknown>(`/plan/${day}${slotQuery(slot)}`, {
      method: 'PUT',
      ...json({ place: place ?? null }),
    }),

  /** Mark a night as leftovers: planned, and nothing added to the list. */
  leftovers: (day: string, slot?: MealSlot) =>
    request<unknown>(`/plan/${day}${slotQuery(slot)}`, {
      method: 'PUT',
      ...json({ leftovers: true }),
    }),

  clearDay: (day: string, slot?: MealSlot) =>
    request<unknown>(`/plan/${day}${slotQuery(slot)}`, { method: 'DELETE' }),

  /**
   * A span of plan entries, for looking back over past weeks. The server caps
   * the span, so asking for more than a few months quietly returns less.
   */
  planRange: (start: string, days: number) =>
    request<PlanEntry[]>(`/plan?start=${start}&days=${days}`),

  // ---- shopping -----------------------------------------------------------
  shopping: (weekStart: string) =>
    request<ShoppingList>(`/shopping?week_start=${weekStart}`),

  setItem: (
    weekStart: string,
    key: string,
    change: { bought?: boolean; skipped?: boolean; actor_id?: string | null },
  ) =>
    request<ShoppingList>('/shopping/item', {
      method: 'PATCH',
      ...json({ week_start: weekStart, key, ...change }),
    }),

  /** Commit the reviewed items to the list. */
  approve: (weekStart: string) =>
    request<ShoppingList>('/shopping/approve', {
      method: 'POST',
      ...json({ week_start: weekStart }),
    }),

  /** Send the week back for review — useful once the plan has changed. */
  unapprove: (weekStart: string) =>
    request<ShoppingList>('/shopping/unapprove', {
      method: 'POST',
      ...json({ week_start: weekStart }),
    }),

  addExtra: (input: {
    week_start: string;
    name: string;
    qty?: string;
    aisle: string;
    added_by?: string | null;
  }) => request<ShoppingList>('/shopping/extras', { method: 'POST', ...json(input) }),

  // ---- categories ---------------------------------------------------------
  categories: () => request<RecipeCategory[]>('/categories'),

  addCategory: (input: { name: string; color_from: string; color_to: string }) =>
    request<RecipeCategory>('/categories', { method: 'POST', ...json(input) }),

  updateCategory: (
    id: string,
    patch: { name?: string; color_from?: string; color_to?: string },
  ) => request<RecipeCategory>(`/categories/${id}`, { method: 'PATCH', ...json(patch) }),

  deleteCategory: (id: string) =>
    request<unknown>(`/categories/${id}`, { method: 'DELETE' }),

  // ---- recipes ------------------------------------------------------------
  recipes: () => request<Recipe[]>('/recipes'),

  saveRecipe: (draft: RecipeDraft, source?: 'manual' | 'link' | 'scan') =>
    request<Recipe>('/recipes', { method: 'POST', ...json({ ...draft, source }) }),

  updateRecipe: (id: string, draft: RecipeDraft) =>
    request<Recipe>(`/recipes/${id}`, { method: 'PUT', ...json(draft) }),

  /** The recipe as it is being cooked tonight: every quantity multiplied by
   *  `batch`. Scaled on the server so the amounts here and the amounts on the
   *  shopping list come from one implementation of the quantity parser. */
  recipeAtBatch: (id: string, batch: number) =>
    request<Recipe>(`/recipes/${id}?batch=${batch}`),

  deleteRecipe: (id: string) => request<unknown>(`/recipes/${id}`, { method: 'DELETE' }),

  // ---- recipe import ------------------------------------------------------
  importLink: (url: string) =>
    request<ImportPreview>('/import/link', { method: 'POST', ...json({ url }) }),

  /**
   * The pages of one recipe, in reading order — a card front and back, or a
   * spread. The server merges them into a single draft.
   */
  importScan: (images: string[], mediaType?: string) =>
    request<ImportPreview>('/import/scan', {
      method: 'POST',
      ...json({ images, media_type: mediaType }),
    }),

  // ---- tasks --------------------------------------------------------------
  tasks: () => request<Task[]>('/tasks'),

  setTaskDone: (id: string, done: boolean) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', ...json({ done }) }),

  addTask: (title: string, meta: string, bucket: number) =>
    request<Task>('/tasks', { method: 'POST', ...json({ title, meta, bucket }) }),

  deleteTask: (id: string) => request<unknown>(`/tasks/${id}`, { method: 'DELETE' }),

  // ---- calendar -----------------------------------------------------------
  events: (from: string, to: string) =>
    request<CalendarEvent[]>(`/calendar/events?from=${from}&to=${to}`),

  addEvent: (input: {
    title: string;
    starts_at: string;
    ends_at?: string | null;
    all_day?: boolean;
    member_id?: string | null;
  }) => request<CalendarEvent>('/calendar/events', { method: 'POST', ...json(input) }),

  deleteEvent: (id: string) =>
    request<unknown>(`/calendar/events/${id}`, { method: 'DELETE' }),

  feeds: () => request<CalendarFeed[]>('/calendar/feeds'),

  addFeed: (input: { name: string; url: string; member_id?: string | null }) =>
    request<CalendarFeed>('/calendar/feeds', { method: 'POST', ...json(input) }),

  deleteFeed: (id: string) =>
    request<unknown>(`/calendar/feeds/${id}`, { method: 'DELETE' }),

  syncFeeds: () => request<{ events: number }>('/calendar/sync', { method: 'POST' }),

  // ---- household ----------------------------------------------------------
  members: () => request<Member[]>('/members'),

  outSpots: () => request<OutSpot[]>('/out-spots'),

  addOutSpot: (name: string) =>
    request<OutSpot>('/out-spots', { method: 'POST', ...json({ name }) }),

  deleteOutSpot: (id: string) =>
    request<unknown>(`/out-spots/${id}`, { method: 'DELETE' }),
};
