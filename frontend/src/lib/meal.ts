import type { MealSlot } from '../api/types';

/**
 * A meal is addressed by one string so the screens can keep one piece of state
 * for "which panel is open". A bare date is dinner, which is what it has always
 * meant; `2026-08-16:lunch` is the prep slot on that day.
 */
export function mealKey(day: string, slot: MealSlot = 'dinner'): string {
  return slot === 'dinner' ? day : `${day}:${slot}`;
}

export function parseMealKey(key: string): { day: string; slot: MealSlot } {
  const [day, slot] = key.split(':');
  return { day, slot: slot === 'lunch' ? 'lunch' : 'dinner' };
}
