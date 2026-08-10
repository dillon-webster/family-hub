import type { Category } from '../api/types';

/**
 * There is no photography in this product. Every recipe is represented by a
 * colour field keyed to its category, which is why the category set is closed
 * and why these two maps live next to the tokens rather than in a component.
 */

export const CATEGORY_FIELD: Record<Category, string> = {
  Dinner: 'linear-gradient(160deg, #C8553D 0%, #8F3626 100%)',
  Breakfast: 'linear-gradient(160deg, #D9962B 0%, #9A6414 100%)',
  Vegetarian: 'linear-gradient(160deg, #6E8B57 0%, #455A34 100%)',
  Dessert: 'linear-gradient(160deg, #7C4E6B 0%, #4E2E43 100%)',
};

export const CATEGORY_COLOR: Record<Category, string> = {
  Dinner: '#C8553D',
  Breakfast: '#D9962B',
  Vegetarian: '#6E8B57',
  Dessert: '#7C4E6B',
};

/** The taupe field for a night nobody is cooking. */
export const OUT_FIELD = 'linear-gradient(160deg, #8A7B6B 0%, #5A4E43 100%)';
export const OUT_COLOR = '#8A7B6B';

/** The three buckets on the household board, with the colour of each. */
export const BUCKETS = [
  { name: 'Short-term', color: '#E37A57', phoneColor: '#C8553D' },
  { name: 'Medium-term', color: '#E3A85C', phoneColor: '#D9962B' },
  { name: 'Long-term', color: '#93B278', phoneColor: '#6E8B57' },
] as const;
