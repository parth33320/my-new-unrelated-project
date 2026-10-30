import { test, expect } from '@playwright/test';

test('E2E: navigate to /game, assert kanji text is visible, click first button, assert modal opens', async ({ page }) => {
  await page.goto('http://localhost:5173/game');

  // Assert kanji text display is visible
  const kanji = page.locator('.kanji-display');
  await expect(kanji).toBeVisible();

  // Click the first choice button
  const firstButton = page.locator('.choice-btn').first();
  await expect(firstButton).toBeVisible();
  await firstButton.click();

  // Assert RevealCard modal is shown
  const modal = page.locator('.reveal-modal-card');
  await expect(modal).toBeVisible();
});
