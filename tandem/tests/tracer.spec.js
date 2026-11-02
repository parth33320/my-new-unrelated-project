import { test, expect } from '@playwright/test';

test.describe('Feature 1 — Timed Game Loop (Stories 1–4)', () => {
  test('E2E: Start timed game, observe countdown, click choice, assert timer stops and reveal modal appears', async ({ page }) => {
    // Navigate to /
    await page.goto('/');

    // Enter username
    const usernameInput = page.locator('#username-input');
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('speed_runner');

    // Click direction button
    const directionBtn = page.locator('.start-btn.ja-btn').first();
    await expect(directionBtn).toBeVisible();
    await directionBtn.click();

    // Assert .question-card visible with .kanji-display text and 4 .choice-btn elements
    const questionCard = page.locator('.question-card');
    await expect(questionCard).toBeVisible({ timeout: 15000 });

    const kanjiDisplay = page.locator('.kanji-display');
    await expect(kanjiDisplay).toBeVisible();
    const kanjiText = await kanjiDisplay.innerText();
    expect(kanjiText.trim().length).toBeGreaterThan(0);

    const choices = page.locator('.choice-btn');
    await expect(choices).toHaveCount(4);

    // Assert timer counts down (.timer-display value decreases over 2 seconds)
    const timerDisplay = page.locator('.timer-display');
    await expect(timerDisplay).toBeVisible();

    // Read initial timer value
    const initialText = await timerDisplay.innerText();
    const initialVal = parseInt(initialText.replace(/\D/g, ''), 10);

    // Wait 2.2 seconds for timer to count down
    await page.waitForTimeout(2200);

    const secondText = await timerDisplay.innerText();
    const secondVal = parseInt(secondText.replace(/\D/g, ''), 10);
    expect(secondVal).toBeLessThan(initialVal);

    // Click first choice
    const firstChoice = choices.first();
    await expect(firstChoice).toBeVisible();
    await firstChoice.click();

    // Assert timer stops (value no longer changes)
    const stoppedText = await timerDisplay.innerText();
    const stoppedVal = parseInt(stoppedText.replace(/\D/g, ''), 10);

    await page.waitForTimeout(1500);

    const postStopText = await timerDisplay.innerText();
    const postStopVal = parseInt(postStopText.replace(/\D/g, ''), 10);
    expect(postStopVal).toBe(stoppedVal);

    // Assert .reveal-modal-card visible
    const revealModal = page.locator('.reveal-modal-card');
    await expect(revealModal).toBeVisible();
  });
});

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
