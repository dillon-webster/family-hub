import { expect, test } from '@playwright/test';

/**
 * End-to-end smoke tests for both surfaces.
 *
 * These run against a real backend and a real database — they plan a dinner on
 * the phone and assert it appears on the kitchen display, which is the one
 * behaviour no unit test can cover and the one the household would notice
 * first if it broke.
 *
 * `BASE_URL` points at a running hub; see `npm run test:e2e` in the README.
 */

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3108';

/** Monday of the current week, in the browser's own timezone — the same rule
 *  the app uses, so the tests look at the week the app is showing. */
function mondayOf(date: Date): string {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  const month = `${result.getMonth() + 1}`.padStart(2, '0');
  const day = `${result.getDate()}`.padStart(2, '0');
  return `${result.getFullYear()}-${month}-${day}`;
}

/** Leave the week we are about to assert on in a known-empty state. */
async function clearWeek(request: import('@playwright/test').APIRequestContext) {
  const monday = new Date(`${mondayOf(new Date())}T12:00:00`);
  for (let index = 0; index < 7; index += 1) {
    const day = new Date(monday);
    day.setDate(day.getDate() + index);
    const iso = `${day.getFullYear()}-${`${day.getMonth() + 1}`.padStart(2, '0')}-${`${day.getDate()}`.padStart(2, '0')}`;
    await request.delete(`${BASE}/api/plan/${iso}`);
  }
}

test.describe('kitchen display', () => {
  test.use({ viewport: { width: 1180, height: 820 } });

  test('moves between all five screens', async ({ page }) => {
    await page.goto(BASE);

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Good (morning|afternoon|evening)/);

    await page.getByRole('button', { name: 'Meals' }).click();
    await expect(page.getByRole('heading', { name: 'Meal plan' })).toBeVisible();

    await page.getByRole('button', { name: 'Recipes' }).click();
    await expect(page.getByRole('heading', { name: 'Recipes' })).toBeVisible();
    await expect(page.getByText('in the family library')).toBeVisible();

    await page.getByRole('button', { name: 'Calendar' }).click();
    await expect(page.getByRole('heading', { name: 'This week' })).toBeVisible();

    await page.getByRole('button', { name: 'Tasks' }).click();
    await expect(page.getByRole('heading', { name: 'Household' })).toBeVisible();
  });

  test('opens a recipe and shows its ingredients and method', async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole('button', { name: 'Recipes' }).click();

    await page.getByRole('button').filter({ hasText: 'Brown butter gnocchi' }).first().click();

    await expect(page.getByText('INGREDIENTS')).toBeVisible();
    await expect(page.getByText('METHOD')).toBeVisible();
    // The quantity column is mono and separate from the ingredient name.
    await expect(page.getByText('potato gnocchi')).toBeVisible();
    await expect(page.getByText('500 g')).toBeVisible();
  });

  test('assigning a dinner rebuilds the shopping list', async ({ page, request }) => {
    await clearWeek(request);
    await page.goto(BASE);
    await page.getByRole('button', { name: 'Meals' }).click();

    // Fill the first empty night from the assign panel.
    await page.getByRole('button').filter({ hasText: 'Tap to add' }).first().click();
    const panel = page.getByRole('dialog');
    await expect(panel.getByText('Assign dinner')).toBeVisible();
    await panel.getByRole('button').filter({ hasText: 'Brown butter gnocchi' }).click();

    await expect(page.getByText('1 of 7 dinners planned')).toBeVisible();

    // Its ingredients should now be waiting to be reviewed.
    await page.getByRole('button', { name: 'Shopping list', exact: true }).click();
    await expect(page.getByText('Check before adding')).toBeVisible();
    await expect(page.getByText('potato gnocchi')).toBeVisible();

    await clearWeek(request);
  });

  test('marking a night as eating out contributes nothing to the list', async ({ page, request }) => {
    await clearWeek(request);
    await page.goto(BASE);
    await page.getByRole('button', { name: 'Meals' }).click();

    await page.getByRole('button').filter({ hasText: 'Tap to add' }).first().click();
    await page.getByRole('dialog').getByRole('button').filter({ hasText: 'Going out to eat' }).click();

    await expect(page.getByText('1 of 7 dinners planned')).toBeVisible();
    // The category overline on the taupe field, not the slot's title — with no
    // named spot both read "Eating out".
    await expect(page.locator('span', { hasText: /^Eating out$/ }).first()).toBeVisible();
    await expect(page.getByText('no cooking')).toBeVisible();

    await page.getByRole('button', { name: 'Shopping list', exact: true }).click();
    // Nothing to buy: the only planned night is one nobody is cooking.
    await expect(page.getByText('Nothing to buy yet')).toBeVisible();

    await clearWeek(request);
  });
});

test.describe('phone companion', () => {
  test.use({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });

  test('switches between the list and the week', async ({ page }) => {
    await page.goto(`${BASE}/phone`);

    await expect(page.getByRole('heading', { name: 'Shopping list' })).toBeVisible();

    await page.getByRole('button', { name: 'Week' }).click();
    await expect(page.getByRole('heading', { name: 'This week' })).toBeVisible();
    await expect(page.getByText('of 7 planned')).toBeVisible();

    await page.getByRole('button', { name: 'List' }).click();
    await expect(page.getByRole('heading', { name: 'Shopping list' })).toBeVisible();
  });

  test('planning a dinner on the phone reaches the hub live', async ({ page, context, request }) => {
    await clearWeek(request);

    // The kitchen display, left open on the Meals screen as it would be.
    const hub = await context.newPage();
    await hub.setViewportSize({ width: 1180, height: 820 });
    await hub.goto(BASE);
    await hub.getByRole('button', { name: 'Meals' }).click();
    await expect(hub.getByText('0 of 7 dinners planned')).toBeVisible();

    await page.goto(`${BASE}/phone`);
    await page.getByRole('button', { name: 'Week' }).click();
    await page.getByRole('button').filter({ hasText: 'Add a dinner' }).first().click();
    await page.getByRole('button').filter({ hasText: 'Miso mushroom ramen' }).first().click();

    await expect(page.getByText('Sent to the kitchen hub')).toBeVisible();

    // Nobody touched the hub — the server pushed, and it refetched.
    await expect(hub.getByText('1 of 7 dinners planned')).toBeVisible({ timeout: 10_000 });
    await expect(hub.getByText('Miso mushroom ramen')).toBeVisible();

    await clearWeek(request);
  });
});
