import type { RecipeCategory } from '../api/types';

/**
 * There is no photography in this product. Every recipe is represented by a
 * colour field keyed to its category, which is why a category owns two colours
 * rather than just a name.
 *
 * These used to be two hard-coded maps over a closed set of four. The set is
 * the household's own now, so the colours travel with the data and these are
 * the functions that turn a category into the gradient the design specifies —
 * still 160deg, still two stops, still the only thing distinguishing one card
 * from another across a kitchen.
 */

/** The 160deg two-stop field a category paints its cards with. */
export const fieldOf = (category: Pick<RecipeCategory, 'color_from' | 'color_to'>) =>
  `linear-gradient(160deg, ${category.color_from} 0%, ${category.color_to} 100%)`;

/**
 * The fallback for a category that cannot be found.
 *
 * Reachable for about one frame: a recipe rendered from a cached payload while
 * the category list is still loading, or immediately after another surface
 * deleted a category. A neutral field keeps the card looking like a card rather
 * than collapsing to a transparent hole, which is what an undefined gradient
 * would do.
 */
export const UNKNOWN_FIELD = 'linear-gradient(160deg, #6B6058 0%, #443C36 100%)';
export const UNKNOWN_COLOR = '#6B6058';

/** The taupe field for a night nobody is cooking. */
export const OUT_FIELD = 'linear-gradient(160deg, #8A7B6B 0%, #5A4E43 100%)';
export const OUT_COLOR = '#8A7B6B';

/** Leftovers: cooler and dimmer than eating out, so the two read apart at a
 *  glance on the plan without either one competing with a real dinner. */
export const LEFTOVERS_FIELD = 'linear-gradient(160deg, #6F7B82 0%, #414C52 100%)';
export const LEFTOVERS_COLOR = '#6F7B82';
