import { test, expect } from '@playwright/test';

test.describe('Feature 3 / Story 10 — Average Answer Speed & Results Screen', () => {
  test('E2E: play through a round against real DB, reach Results, assert avg speed stat', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Ensure page loaded
    const usernameInput = page.locator('#username-input');
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('speed_tester');

    // Start game
    const startButton = page.locator('.start-btn.zh-btn').first();
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Loop through all 10 questions
    for (let i = 1; i <= 10; i++) {
      // Wait for question card
      await page.waitForSelector('.question-card', { timeout: 15000 });

      // Click first choice button
      const choiceBtn = page.locator('.choice-btn').first();
      await expect(choiceBtn).toBeVisible();
      await choiceBtn.click();

      // Modal appears
      const modal = page.locator('.reveal-modal-card');
      await expect(modal).toBeVisible();

      // Click Next question / Finish round button
      const nextBtn = page.locator('.next-btn');
      await expect(nextBtn).toBeVisible();
      await nextBtn.click();
    }

    // Wait for redirect to /results
    await page.waitForURL('**/results', { timeout: 15000 });
    await expect(page.locator('.results-container')).toBeVisible();

    // Assert Avg Answer Speed stat is visible alongside similarity meter
    const avgSpeedLabel = page.locator('.stat-label', { hasText: 'Avg Answer Speed' });
    await expect(avgSpeedLabel).toBeVisible();

    const avgSpeedItem = page.locator('.stat-item', { has: avgSpeedLabel });
    const avgSpeedValue = avgSpeedItem.locator('.stat-value');
    await expect(avgSpeedValue).toBeVisible();

    const text = await avgSpeedValue.innerText();
    // Must be a number followed by 's', e.g. "2.4s" or "0.8s"
    expect(text).toMatch(/^\d+(\.\d+)?s$/);

    // Assert similarity meter is also visible
    const similarityLabel = page.locator('.stat-label', { hasText: 'True Friend Similarity' });
    await expect(similarityLabel).toBeVisible();
  });

  test('Security: direct navigation to /results without state does not crash or expose data', async ({ page }) => {
    // Direct navigation without state
    await page.goto('/results');

    // Page must render gracefully without uncaught exceptions or crashes
    const resultsContainer = page.locator('.results-container');
    await expect(resultsContainer).toBeVisible();

    // Verify stats are handled gracefully
    const scoreVal = page.locator('.stat-item', { hasText: 'Final Score' }).locator('.stat-value');
    await expect(scoreVal).toContainText('0 pts');

    const avgSpeedVal = page.locator('.stat-item', { hasText: 'Avg Answer Speed' }).locator('.stat-value');
    await expect(avgSpeedVal).toHaveText('N/A');

    // No sensitive data or debug stack dumps visible
    const pageText = await page.innerText('body');
    expect(pageText).not.toContain('undefined');
    expect(pageText).not.toContain('Cannot read properties');
    expect(pageText).not.toContain('stack');
  });
});
