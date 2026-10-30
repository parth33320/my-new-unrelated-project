import { test, expect } from '@playwright/test';

test('Tracer Bullet E2E: navigate to /game, assert kanji text is visible, click first button, assert page does not crash', async ({ page }) => {
  await page.goto('http://localhost:3001/game');

  // Assert kanji text '海軍' is visible
  const kanji = page.getByText('海軍');
  await expect(kanji).toBeVisible();

  // Click the first button ('navy')
  const firstButton = page.getByRole('button', { name: 'navy' });
  await expect(firstButton).toBeVisible();
  await firstButton.click();

  // Assert page does not crash and shows selected answer
  const selected = page.getByText('Selected: navy');
  await expect(selected).toBeVisible();
});
