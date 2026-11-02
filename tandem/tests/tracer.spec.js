import { test, expect } from '@playwright/test';

test.describe('Feature 3 / Stories 8–10 — Final Similarity Meter & Avg Answer Speed', () => {
  test('E2E: after completing a 10-question round, URL is /results and all stats are visible', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Ensure home page loaded
    const usernameInput = page.locator('#username-input');
    await expect(usernameInput).toBeVisible({ timeout: 15000 });
    const uniqueUser = `speed_${Date.now().toString().slice(-5)}`;
    await usernameInput.fill(uniqueUser);

    // Start game
    const startButton = page.locator('.start-btn.zh-btn').first();
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Loop through all 10 questions
    for (let i = 1; i <= 10; i++) {
      // Wait for question card
      await page.waitForSelector('.question-card', { timeout: 20000 });
      await page.waitForTimeout(300);

      // Click first choice button
      const choiceBtn = page.locator('.choice-btn').first();
      await expect(choiceBtn).toBeVisible({ timeout: 10000 });
      await choiceBtn.click();

      // Modal appears
      const modal = page.locator('.reveal-modal-card');
      await expect(modal).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(200);

      // Click Next question / Finish round button
      const nextBtn = page.locator('.next-btn');
      await expect(nextBtn).toBeVisible({ timeout: 10000 });
      await nextBtn.click();
    }

    // After completing a 10-question round, URL is /results
    await page.waitForURL('**/results', { timeout: 20000 });
    expect(page.url()).toMatch(/\/results$/);

    // .results-container is visible
    const resultsContainer = page.locator('.results-container');
    await expect(resultsContainer).toBeVisible({ timeout: 10000 });

    // .stat-label "True Friend Similarity" is visible with a value matching /\d+%/
    const similarityLabel = page.locator('.stat-label', { hasText: 'True Friend Similarity' });
    await expect(similarityLabel).toBeVisible();
    const similarityItem = page.locator('.stat-item', { has: similarityLabel });
    const similarityValue = similarityItem.locator('.stat-value');
    await expect(similarityValue).toBeVisible();
    const similarityText = await similarityValue.innerText();
    expect(similarityText).toMatch(/\d+%/);

    // .stat-label "Avg Answer Speed" is visible with a value matching /^\d+(\.\d+)?s$/
    const avgSpeedLabel = page.locator('.stat-label', { hasText: 'Avg Answer Speed' });
    await expect(avgSpeedLabel).toBeVisible();
    const avgSpeedItem = page.locator('.stat-item', { has: avgSpeedLabel });
    const avgSpeedValue = avgSpeedItem.locator('.stat-value');
    await expect(avgSpeedValue).toBeVisible();
    const avgSpeedText = await avgSpeedValue.innerText();
    expect(avgSpeedText).toMatch(/^\d+(\.\d+)?s$/);

    // .stat-label "Final Score" is visible
    const finalScoreLabel = page.locator('.stat-label', { hasText: 'Final Score' });
    await expect(finalScoreLabel).toBeVisible();
    const finalScoreItem = page.locator('.stat-item', { has: finalScoreLabel });
    const finalScoreValue = finalScoreItem.locator('.stat-value');
    await expect(finalScoreValue).toBeVisible();
  });

  test('Security: Direct GET to /results (no router state) renders gracefully: score shows 0 pts, avg speed shows N/A, no undefined text, no stack traces visible in body', async ({ page }) => {
    // Direct GET to /results
    await page.goto('/results');

    // Page must render gracefully without uncaught exceptions or crashes
    const resultsContainer = page.locator('.results-container');
    await expect(resultsContainer).toBeVisible({ timeout: 10000 });

    // Score shows 0 pts
    const finalScoreLabel = page.locator('.stat-label', { hasText: 'Final Score' });
    await expect(finalScoreLabel).toBeVisible();
    const scoreVal = page.locator('.stat-item', { has: finalScoreLabel }).locator('.stat-value');
    await expect(scoreVal).toContainText('0 pts');

    // Avg speed shows N/A
    const avgSpeedLabel = page.locator('.stat-label', { hasText: 'Avg Answer Speed' });
    await expect(avgSpeedLabel).toBeVisible();
    const avgSpeedVal = page.locator('.stat-item', { has: avgSpeedLabel }).locator('.stat-value');
    await expect(avgSpeedVal).toHaveText('N/A');

    // No undefined text, no stack traces visible in body
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('Cannot read properties');
    expect(bodyText).not.toContain('stack trace');
    expect(bodyText).not.toContain('Error:');
  });
});
