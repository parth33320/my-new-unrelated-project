import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = path.resolve('..');
const tempFramesDir = path.join(rootDir, 'temp_feature1_frames');
const outputGifRoot = path.join(rootDir, 'feature1-timed-game-loop.gif');
const outputGifDocs = path.join(rootDir, 'docs/assets/feature1-timed-game-loop.gif');

fs.mkdirSync(tempFramesDir, { recursive: true });
fs.mkdirSync(path.join(rootDir, 'docs/assets'), { recursive: true });

let frameCounter = 0;

async function captureFrames(page, count = 1, delayMs = 250) {
  for (let i = 0; i < count; i++) {
    frameCounter++;
    const frameName = `frame-${String(frameCounter).padStart(5, '0')}.png`;
    const framePath = path.join(tempFramesDir, frameName);
    await page.screenshot({ path: framePath });
    if (i < count - 1 && delayMs > 0) {
      await page.waitForTimeout(delayMs);
    }
  }
}

async function simulateClickWithRipple(page, selectorOrLocator) {
  let locator;
  if (typeof selectorOrLocator === 'string') {
    locator = page.locator(selectorOrLocator).first();
    const count = await locator.count();
    if (count === 0) {
      locator = page.getByText(selectorOrLocator).first();
    }
  } else {
    locator = selectorOrLocator;
  }

  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();

  if (box) {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await page.evaluate(({ x, y }) => {
      const ripple = document.createElement('div');
      ripple.className = 'demo-click-ripple';
      ripple.style.position = 'fixed';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = '36px';
      ripple.style.height = '36px';
      ripple.style.marginLeft = '-18px';
      ripple.style.marginTop = '-18px';
      ripple.style.borderRadius = '50%';
      ripple.style.backgroundColor = 'rgba(239, 68, 68, 0.6)';
      ripple.style.border = '2px solid rgba(239, 68, 68, 0.9)';
      ripple.style.pointerEvents = 'none';
      ripple.style.zIndex = '999999';
      ripple.style.transform = 'scale(0.3)';
      ripple.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
      document.body.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(2.2)';
        ripple.style.opacity = '0';
      });

      setTimeout(() => ripple.remove(), 500);
    }, { x, y });

    await captureFrames(page, 2, 100);
  }

  await locator.click();
}

async function recordFeature1() {
  console.log('Launching browser to record Feature 1 on live Render deployment...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/google-chrome',
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  // Mock backend API responses for player creation and round generation
  await page.route('**/api/players', async (route) => {
    console.log('Intercepted /api/players request');
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        username: 'JulesDemo1',
        created_at: new Date().toISOString(),
      }),
    });
  });

  await page.route('**/api/words/round*', async (route) => {
    console.log('Intercepted /api/words/round request');
    const mockRound = {
      questions: [
        {
          wordId: 1,
          display: '手紙',
          prompt: 'What does 手紙 mean in Japanese?',
          distractors: ['Toilet paper', 'Handwriting', 'Hand towel'],
          correctIndex: 1,
          relation: 'false',
          choices: ['Toilet paper', 'Letter', 'Handwriting', 'Hand towel'],
          reveal: {
            jp_form: '手紙',
            jp_reading: ['てがみ'],
            meaning_ja: 'Letter, mail, written correspondence',
            category_ja: 'Stationery & Communication',
            zh_simplified: '手纸',
            pinyin: ['shǒuzhǐ'],
            meaning_zh: 'Toilet paper, sanitary tissue',
            category_zh: 'Household & Daily Items',
            relation: 'false',
          },
        },
      ],
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockRound),
    });
  });

  console.log('1. Navigating to live Render deployment: https://my-new-unrelated-project.onrender.com');
  await page.goto('https://my-new-unrelated-project.onrender.com', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(500);
  await captureFrames(page, 3, 200);

  // Enter username "JulesDemo1"
  console.log('Entering username "JulesDemo1"...');
  const usernameInput = page.locator('#username-input');
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.click();
  await usernameInput.clear();

  const username = 'JulesDemo1';
  for (const char of username) {
    await usernameInput.type(char, { delay: 80 });
    await captureFrames(page, 1, 50);
  }

  await captureFrames(page, 2, 200);

  // Click "I know Chinese → guess Japanese"
  console.log('Clicking "I know Chinese → guess Japanese"...');
  await simulateClickWithRipple(page, 'I know Chinese → guess Japanese');
  await captureFrames(page, 2, 150);

  // 2. Wait for game page to load with 10-second countdown timer visible
  console.log('2. Waiting for game page and timer...');
  await page.waitForSelector('.game-container', { timeout: 20000 });
  await page.waitForSelector('.timer-container', { timeout: 20000 });
  await page.waitForSelector('.question-card', { timeout: 20000 });

  // Let the countdown timer visibly tick down (e.g. from 10s down to ~7s or 6s)
  console.log('Capturing frames of countdown timer ticking...');
  // Capture 14 frames at ~250ms interval = ~3.5 seconds of timer ticking down
  await captureFrames(page, 14, 250);

  // 3. Click answer choice ("Letter") before timer expires
  console.log('3. Clicking answer choice before timer expires...');
  const letterChoice = page.getByRole('button', { name: 'Letter' });
  await letterChoice.waitFor({ state: 'visible' });
  await simulateClickWithRipple(page, letterChoice);

  // 4. Confirm timer stops and reveal modal appears
  console.log('4. Waiting for reveal modal to appear and confirming timer stopped...');
  await page.waitForSelector('.reveal-modal-card', { state: 'visible', timeout: 10000 });

  // Keep modal and frozen timer visible on screen
  console.log('Capturing frames of frozen timer and reveal modal...');
  await captureFrames(page, 10, 300);

  await page.close();
  await context.close();
  await browser.close();

  console.log(`Captured ${frameCounter} frames in ${tempFramesDir}`);

  // Convert frame sequence to high quality GIF using ffmpeg & gifsicle
  console.log('Generating feature1-timed-game-loop.gif from frames...');
  const ffmpegCmd = `ffmpeg -y -framerate 4 -pattern_type glob -i "${tempFramesDir}/*.png" -vf "fps=10,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${outputGifRoot}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  try {
    execSync(`gifsicle -O3 --lossy=80 "${outputGifRoot}" -o "${outputGifRoot}"`, { stdio: 'inherit' });
  } catch (e) {
    console.warn('gifsicle optimization skipped:', e.message);
  }

  // Also copy to docs/assets/feature1-timed-game-loop.gif
  fs.copyFileSync(outputGifRoot, outputGifDocs);

  const stats = fs.statSync(outputGifRoot);
  console.log(`Successfully generated ${outputGifRoot}: ${(stats.size / 1024).toFixed(2)} KB`);

  // Cleanup temp frames dir
  fs.rmSync(tempFramesDir, { recursive: true, force: true });
}

recordFeature1().catch((err) => {
  console.error('Recording failed:', err);
  process.exit(1);
});
