import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { api } from './client';
import type { Bootstrap, MealSlot, PlanEntry, Recipe, RecipeCategory, Topic } from './types';
import { addDays, isoDate, mondayOf } from '../lib/week';
import { UNKNOWN_COLOR, UNKNOWN_FIELD, fieldOf } from '../design/category';

interface Store {
  data: Bootstrap | null;
  error: string | null;
  /** True while the very first load is in flight; refreshes are silent. */
  loading: boolean;
  /** Whether the live connection to the hub is currently up. */
  connected: boolean;
  /** Monday of the week both surfaces are showing. */
  weekStart: Date;
  setWeekStart: (date: Date) => void;
  /** The clock, ticking every 20s as the design specifies. */
  now: Date;
  refresh: () => Promise<void>;
  /** Look up a planned meal. Defaults to dinner, which is the plan's spine. */
  entryFor: (day: Date, slot?: MealSlot) => PlanEntry | undefined;
  recipeFor: (day: Date, slot?: MealSlot) => Recipe | undefined;
  recipeById: (id: string | null | undefined) => Recipe | undefined;
  /** The household's categories, in their own order. */
  categories: RecipeCategory[];
  categoryByName: (name: string) => RecipeCategory | undefined;
  /** The gradient a category paints its cards with, by category name. */
  categoryField: (name: string) => string;
  /** That category's flat accent, for spines and dots. */
  categoryColor: (name: string) => string;
}

const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [data, setData] = useState<Bootstrap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const weekKey = isoDate(weekStart);

  // A ref so the SSE handler always refetches the week currently on screen
  // without having to tear the connection down every time the week changes.
  const weekKeyRef = useRef(weekKey);
  weekKeyRef.current = weekKey;

  const load = useCallback(async (key: string) => {
    try {
      const next = await api.bootstrap(key);
      // A slow response for a week the user has already navigated away from
      // must not overwrite what they are looking at now.
      if (weekKeyRef.current !== key) return;
      setData(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the hub.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(weekKey);
  }, [weekKey, load]);

  // ---- the clock ---------------------------------------------------------
  // 20 seconds is from the handoff: fast enough that the minute is never
  // visibly wrong, slow enough to be free on an always-on display.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 20_000);
    return () => window.clearInterval(timer);
  }, []);

  // ---- the live link -----------------------------------------------------
  // The kitchen display runs for weeks. EventSource reconnects on its own, but
  // it gives up after a network change or a long sleep, so failures are caught
  // and retried with a backoff, and every reconnect refetches rather than
  // trying to replay what was missed.
  useEffect(() => {
    let source: EventSource | null = null;
    let retry: number | undefined;
    let attempt = 0;
    let closed = false;

    const onTopic = (topic: Topic) => () => {
      // Every topic is a nudge to reload the one payload both surfaces read.
      // Cheap for a household-sized dataset, and it cannot drift.
      if (topic) void load(weekKeyRef.current);
    };

    const connect = () => {
      if (closed) return;
      source = new EventSource('/api/events');

      source.onopen = () => {
        attempt = 0;
        setConnected(true);
      };

      source.onerror = () => {
        setConnected(false);
        source?.close();
        if (closed) return;
        // Back off to a 30s ceiling: a hub that has been unplugged should not
        // hammer the network, but it should recover within half a minute of
        // coming back.
        const delay = Math.min(1000 * 2 ** attempt, 30_000);
        attempt += 1;
        retry = window.setTimeout(connect, delay);
      };

      const topics: Topic[] = [
        'plan',
        'recipes',
        'shopping',
        'calendar',
        'tasks',
        'members',
        'out-spots',
        'refresh',
      ];
      for (const topic of topics) {
        source.addEventListener(topic, onTopic(topic));
      }
    };

    connect();

    return () => {
      closed = true;
      window.clearTimeout(retry);
      source?.close();
    };
  }, [load]);

  // ---- waking up ---------------------------------------------------------
  // An iPad that has been asleep, or a phone returning from the lock screen,
  // comes back with a stale view and possibly a dead stream. Refetch on the
  // way back in, and roll the week over if it is no longer the same Monday.
  useEffect(() => {
    const resume = () => {
      if (document.visibilityState !== 'visible') return;
      const currentMonday = mondayOf(new Date());
      setNow(new Date());
      setWeekStart((previous) =>
        isoDate(previous) === isoDate(mondayOf(previous)) &&
        isoDate(previous) !== isoDate(currentMonday) &&
        // Only auto-advance when the display was showing the week that has
        // just ended, never when someone has deliberately paged forward.
        isoDate(previous) === isoDate(addDays(currentMonday, -7))
          ? currentMonday
          : previous,
      );
      void load(weekKeyRef.current);
    };

    document.addEventListener('visibilitychange', resume);
    window.addEventListener('online', resume);
    return () => {
      document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('online', resume);
    };
  }, [load]);

  const value = useMemo<Store>(() => {
    const byId = new Map((data?.recipes ?? []).map((recipe) => [recipe.id, recipe]));
    // Keyed by day *and* slot now that a day carries both a dinner and a lunch.
    const byMeal = new Map(
      (data?.plan ?? []).map((entry) => [`${entry.day}:${entry.slot}`, entry]),
    );
    const categories = data?.categories ?? [];
    const byName = new Map(categories.map((category) => [category.name, category]));

    const entryFor = (day: Date, slot: MealSlot = 'dinner') =>
      byMeal.get(`${isoDate(day)}:${slot}`);

    return {
      data,
      error,
      loading,
      connected,
      weekStart,
      setWeekStart,
      now,
      refresh: () => load(weekKeyRef.current),
      entryFor,
      recipeById: (id) => (id ? byId.get(id) : undefined),
      recipeFor: (day, slot) => {
        const entry = entryFor(day, slot);
        return entry?.recipe_id ? byId.get(entry.recipe_id) : undefined;
      },
      categories,
      categoryByName: (name) => byName.get(name),
      categoryField: (name) => {
        const category = byName.get(name);
        return category ? fieldOf(category) : UNKNOWN_FIELD;
      },
      categoryColor: (name) => byName.get(name)?.color_from ?? UNKNOWN_COLOR,
    };
  }, [data, error, loading, connected, weekStart, now, load]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
