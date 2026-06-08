import { expect, test } from '@playwright/test';

test('apex redirects to the default locale and renders the hero', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/bg$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('en locale renders English copy', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByRole('link', { name: /shop filaments/i })).toBeVisible();
});
