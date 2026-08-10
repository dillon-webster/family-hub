import { api } from '../api/client';
import type { PlanEntry } from '../api/types';
import { addDays, isoDate, mondayOf } from './week';

/**
 * Looking back over the plan, shared by both surfaces.
 *
 * The kitchen display and the phone show this differently — a right-hand sheet
 * on one, a bottom sheet on the other — but they must agree on what "the last
 * few weeks" means and how the days group. Keeping the range and the grouping
 * here is the same reasoning that keeps the quantity splitter in Rust: two
 * implementations of one rule drift.
 */

/** Weeks of history to ask for, counting back from the current one. */
export const WEEKS_BACK = 7;

export interface Week {
  monday: Date;
  entries: PlanEntry[];
}

/** Group flat entries into weeks, newest first, dropping the empty ones. */
export function byWeek(entries: PlanEntry[]): Week[] {
  const weeks = new Map<string, Week>();

  for (const entry of entries) {
    // Midday, so a date-only string is never pushed across a boundary by the
    // device's own offset — the same reason the rest of the app avoids UTC.
    const monday = mondayOf(new Date(`${entry.day}T12:00:00`));
    const key = isoDate(monday);
    const week = weeks.get(key) ?? { monday, entries: [] };
    week.entries.push(entry);
    weeks.set(key, week);
  }

  return [...weeks.values()].sort((a, b) => b.monday.getTime() - a.monday.getTime());
}

/**
 * The weeks behind us, most recent first. The window is computed from the
 * device clock, like every other date in the app — the server is never asked
 * what today is.
 */
export async function loadHistory(): Promise<Week[]> {
  const start = addDays(mondayOf(new Date()), -WEEKS_BACK * 7);
  return byWeek(await api.planRange(isoDate(start), (WEEKS_BACK + 1) * 7));
}
