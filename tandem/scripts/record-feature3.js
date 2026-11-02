import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = path.resolve('..');
const tempFramesDir = path.join(rootDir, 'temp_feature3_frames');
const videoDir = path.join(rootDir, 'temp_feature3_video');
const outputGifRoot = path.join(rootDir, 'feature3-similarity-meter.gif');
const outputGifDocs = path.join(rootDir, 'docs/assets/feature3-similarity-meter.gif');

fs.mkdirSync(tempFramesDir, { recursive: true });
fs.mkdirSync(videoDir, { recursive: true });
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

async function recordFeature3() {
  console.log('Recording Feature 3 with Playwright Video & GIF generation...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/google-chrome',
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  console.log('Navigating to http://localhost:3001');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await captureFrames(page, 3, 200);

  const usernameInput = page.locator('#username-input');
  await usernameInput.fill('SpeedRunner');
  await captureFrames(page, 2, 200);

  const startBtn = page.locator('.start-btn.zh-btn').first();
  await simulateClickWithRipple(page, startBtn);

  // Play through 10 questions with slight pauses to capture authentic answer speed
  for (let q = 1; q <= 10; q++) {
    await page.waitForSelector('.question-card', { timeout: 15000 });
    await page.waitForTimeout(400); // 400ms pause to simulate reading
    await captureFrames(page, 2, 150);

    const firstChoice = page.locator('.choice-btn').first();
    await simulateClickWithRipple(page, firstChoice);

    await page.waitForSelector('.reveal-modal-card', { timeout: 10000 });
    await captureFrames(page, 2, 150);

    const nextBtn = page.locator('.next-btn');
    await simulateClickWithRipple(page, nextBtn);
  }

  // Reach Results page
  await page.waitForURL('**/results', { timeout: 15000 });
  await page.waitForSelector('.results-container', { timeout: 10000 });
  await page.waitForSelector('.stat-item', { timeout: 10000 });

  // Highlight and linger on results screen
  console.log('Capturing Results screen frames...');
  await captureFrames(page, 15, 300);

  const video = page.video();
  const videoPath = await video.path();

  await page.close();
  await context.close();
  await browser.close();

  console.log(`Video recorded to ${videoPath}`);

  // Generate GIF with ffmpeg
  console.log('Compiling GIF with ffmpeg...');
  const ffmpegCmd = `ffmpeg -y -framerate 4 -pattern_type glob -i "${tempFramesDir}/*.png" -vf "fps=10,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${outputGifRoot}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  // Copy to docs/assets
  fs.copyFileSync(outputGifRoot, outputGifDocs);

  // Copy recorded webm to docs/assets/feature3-results-speed.webm
  const targetWebm = path.join(rootDir, 'docs/assets/feature3-results-speed.webm');
  fs.copyFileSync(videoPath, targetWebm);

  const stats = fs.statSync(outputGifRoot);
  console.log(`GIF generated: ${outputGifRoot} (${(stats.size / 1024).toFixed(1)} KB)`);
  console.log(`WebM video saved to: ${targetWebm}`);

  // Cleanup temp frames
  fs.rmSync(tempFramesDir, { recursive: true, force: true });
  fs.rmSync(videoDir, { recursive: true, force: true });
}

recordFeature3().catch((err) => {
  console.error('Error recording Feature 3:', err);
  process.exit(1);
});
