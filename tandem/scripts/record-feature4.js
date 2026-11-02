import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.BASE_URL || 'https://my-new-unrelated-project.onrender.com';
const rootDir = path.resolve('..');
const tempFramesDir = path.join(rootDir, 'temp_feature4_frames');
const videoDir = path.join(rootDir, 'temp_feature4_video');
const outputGifRoot = path.join(rootDir, 'feature4-missed-words.gif');
const outputGifDocs = path.join(rootDir, 'docs/assets/feature4-missed-words.gif');
const outputWebmDocs = path.join(rootDir, 'docs/assets/feature4-missed-words.webm');

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

async function recordFeature4() {
  console.log('Recording Feature 4 Playwright Video and capturing frames for GIF...');
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

  const uniqueUsername = `MissedMaster_${Date.now() % 100000}`;
  console.log(`Navigating to ${BASE_URL} as ${uniqueUsername}...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await captureFrames(page, 3, 200);

  const usernameInput = page.locator('#username-input');
  await usernameInput.fill(uniqueUsername);
  await captureFrames(page, 2, 200);

  const startBtn = page.locator('.start-btn.zh-btn').first();
  await simulateClickWithRipple(page, startBtn);

  // Play through 10 questions with intentional wrong answers
  for (let q = 1; q <= 10; q++) {
    await page.waitForSelector('.question-card', { timeout: 15000 });
    await captureFrames(page, 2, 150);

    // Pick first choice
    const firstChoice = page.locator('.choice-btn').first();
    await simulateClickWithRipple(page, firstChoice);

    await page.waitForSelector('.reveal-modal-card', { timeout: 10000 });
    await captureFrames(page, 2, 150);

    const nextBtn = page.locator('.next-btn');
    await simulateClickWithRipple(page, nextBtn);
  }

  // Reach Results page
  await page.waitForURL('**/results', { timeout: 20000 });
  await page.waitForSelector('.results-container', { timeout: 10000 });
  await captureFrames(page, 3, 200);

  // Navigate to /profile
  console.log('Navigating to Profile page...');
  const profileLink = page.locator('nav a[href="/profile"]').first();
  await simulateClickWithRipple(page, profileLink);

  await page.waitForURL('**/profile', { timeout: 15000 });
  await page.waitForSelector('.missed-words-list', { timeout: 15000 });
  console.log('Profile page loaded with .missed-words-list!');

  // Linger on missed words section
  await captureFrames(page, 15, 300);

  const video = page.video();
  const videoPath = await video.path();

  await page.close();
  await context.close();
  await browser.close();

  console.log(`Video recorded to ${videoPath}`);

  // Copy recorded webm
  fs.copyFileSync(videoPath, outputWebmDocs);
  console.log(`Copied WebM video to ${outputWebmDocs}`);

  // Assemble GIF using python script with PIL
  console.log('Compiling GIF with Python PIL...');
  const pyScript = path.join(rootDir, 'compile_f4_gif.py');
  fs.writeFileSync(pyScript, `
import os
import shutil
from pathlib import Path
from PIL import Image

temp_frames_dir = Path("${tempFramesDir}")
output_gif_root = Path("${outputGifRoot}")
output_gif_docs = Path("${outputGifDocs}")

frame_files = sorted(temp_frames_dir.glob("frame-*.png"))
print(f"Loading {len(frame_files)} frames...")
images = []
durations = [250] * len(frame_files)
for f in frame_files:
    img = Image.open(f).convert("RGB")
    img_resized = img.resize((960, 540), Image.Resampling.LANCZOS)
    img_quantized = img_resized.quantize(colors=128, method=Image.Resampling.LANCZOS, dither=Image.Dither.FLOYDSTEINBERG)
    images.append(img_quantized)

if images:
    images[0].save(
        str(output_gif_root),
        save_all=True,
        append_images=images[1:],
        duration=durations,
        loop=0,
        optimize=True
    )
    shutil.copyfile(output_gif_root, output_gif_docs)
    print(f"GIF saved to {output_gif_root} and {output_gif_docs}")
`);
  const { execSync } = await import('node:child_process');
  execSync(`python3 ${pyScript}`, { stdio: 'inherit' });
  fs.unlinkSync(pyScript);

  // Cleanup temp frames
  fs.rmSync(tempFramesDir, { recursive: true, force: true });
  fs.rmSync(videoDir, { recursive: true, force: true });
}

recordFeature4().catch((err) => {
  console.error('Error recording Feature 4:', err);
  process.exit(1);
});
