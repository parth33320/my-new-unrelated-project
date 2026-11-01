import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { pool } from '../server/src/db/pool.js';

// Setup directories
const rootDir = path.resolve('.');
const outputDir = path.join(rootDir, 'docs/assets');
const tempDir = path.join(rootDir, 'temp_demo_frames');
const videoDir = path.join(rootDir, 'temp_demo_video');

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(videoDir, { recursive: true });

async function seedDatabase() {
  console.log('Seeding DB with demo player and scores...');
  try {
    const p1 = await pool.query(`
      INSERT INTO players (username) VALUES ('demo_player')
      ON CONFLICT (lower(username)) DO UPDATE SET username = EXCLUDED.username
      RETURNING id
    `);
    const pid = p1.rows[0].id;
    await pool.query('DELETE FROM scores WHERE player_id = $1', [pid]);
    await pool.query(`
      INSERT INTO scores (player_id, score, direction) VALUES
      ($1, 95.00, 'zh-ja'),
      ($1, 85.00, 'zh-ja'),
      ($1, 90.00, 'ja-zh')
    `, [pid]);

    const p2 = await pool.query(`
      INSERT INTO players (username) VALUES ('KanjiMaster')
      ON CONFLICT (lower(username)) DO UPDATE SET username = EXCLUDED.username
      RETURNING id
    `);
    await pool.query('DELETE FROM scores WHERE player_id = $1', [p2.rows[0].id]);
    await pool.query(`
      INSERT INTO scores (player_id, score, direction) VALUES
      ($1, 100.00, 'zh-ja'),
      ($1, 80.00, 'ja-zh')
    `, [p2.rows[0].id]);

    console.log('Database seeded successfully.');
  } catch (err) {
    console.error('Error seeding DB:', err);
  } finally {
    await pool.end();
  }
}

let frameCounter = 0;

async function captureFrames(page, frameDir, count = 1, delayMs = 400) {
  fs.mkdirSync(frameDir, { recursive: true });
  for (let i = 0; i < count; i++) {
    frameCounter++;
    const frameName = `frame-${String(frameCounter).padStart(4, '0')}.png`;
    const framePath = path.join(frameDir, frameName);
    await page.screenshot({ path: framePath });
    if (i < count - 1 && delayMs > 0) {
      await page.waitForTimeout(delayMs);
    }
  }
}

async function showTitleCard(page, sectionDir, titleText, subtitleText = '') {
  console.log(`Title card: "${titleText}"`);
  await page.evaluate(({ titleText, subtitleText }) => {
    let card = document.getElementById('demo-title-card');
    if (!card) {
      card = document.createElement('div');
      card.id = 'demo-title-card';
      card.style.position = 'fixed';
      card.style.top = '0';
      card.style.left = '0';
      card.style.width = '100vw';
      card.style.height = '100vh';
      card.style.backgroundColor = '#0f172a';
      card.style.color = '#ffffff';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.justifyContent = 'center';
      card.style.alignItems = 'center';
      card.style.zIndex = '9999999';
      card.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      card.style.padding = '2rem';
      card.style.boxSizing = 'border-box';
      document.body.appendChild(card);
    }
    card.innerHTML = `
      <div style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 9999px; padding: 6px 18px; color: #60a5fa; font-weight: 600; font-size: 1rem; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
        ${subtitleText || 'Tandem Demo'}
      </div>
      <h1 style="font-size: 3.2rem; font-weight: 800; margin: 0; text-align: center; background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        ${titleText}
      </h1>
    `;
  }, { titleText, subtitleText });

  await captureFrames(page, sectionDir, 4, 400);

  await page.evaluate(() => {
    const card = document.getElementById('demo-title-card');
    if (card) card.remove();
  });
  await page.waitForTimeout(300);
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
      ripple.style.backgroundColor = 'rgba(239, 68, 68, 0.5)';
      ripple.style.border = '2px solid rgba(239, 68, 68, 0.9)';
      ripple.style.pointerEvents = 'none';
      ripple.style.zIndex = '999999';
      ripple.style.transform = 'scale(0.3)';
      ripple.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
      document.body.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(2.0)';
        ripple.style.opacity = '0';
      });

      setTimeout(() => ripple.remove(), 500);
    }, { x, y });

    await page.waitForTimeout(200);
  }

  await locator.click();
  await page.waitForTimeout(1200); // 1200ms pause after click (human speed)
}

async function smoothScroll(page, totalPixels = 300, direction = 'down') {
  const steps = 5;
  const stepPx = Math.round(totalPixels / steps); // 60px each
  for (let i = 0; i < steps; i++) {
    const deltaY = direction === 'down' ? stepPx : -stepPx;
    await page.evaluate((dy) => window.scrollBy(0, dy), deltaY);
    await page.waitForTimeout(120); // 120ms apart
  }
}

async function runDemo() {
  await seedDatabase();

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

  // SECTION 1 — Home screen (0:00-0:20)
  console.log('Starting Section 1 — Home screen');
  const sec1Dir = path.join(tempDir, 'section-1');
  await page.goto('http://localhost:5173');
  await showTitleCard(page, sec1Dir, 'Tandem — Chinese × Japanese Quiz', 'Section 1');

  await page.waitForSelector('#username-input');
  const usernameInput = page.locator('#username-input');
  await usernameInput.clear();

  const targetName = 'demo_player';
  for (const char of targetName) {
    await usernameInput.type(char, { delay: 80 }); // 80ms/char typing
  }

  await captureFrames(page, sec1Dir, 5, 400);
  await simulateClickWithRipple(page, 'I know Chinese → guess Japanese');
  await captureFrames(page, sec1Dir, 4, 300);

  // SECTION 2 — Game loop (0:20-0:55)
  console.log('Starting Section 2 — Game loop');
  const sec2Dir = path.join(tempDir, 'section-2');
  await page.waitForSelector('.game-container');
  await showTitleCard(page, sec2Dir, 'Timed Game Loop', 'Section 2');

  // Word appearing on screen
  await page.waitForSelector('.question-card');
  // Capture 6 frames of timer counting down
  await captureFrames(page, sec2Dir, 6, 600);

  // Click answer button
  const firstChoice = page.locator('.choice-btn').first();
  await simulateClickWithRipple(page, firstChoice);
  await captureFrames(page, sec2Dir, 4, 300);

  // SECTION 3 — Word Reveal Modal (0:55-1:20)
  console.log('Starting Section 3 — Word Reveal Modal');
  const sec3Dir = path.join(tempDir, 'section-3');
  await page.waitForSelector('.reveal-modal-card');
  await showTitleCard(page, sec3Dir, 'Word Reveal Modal', 'Section 3');

  // Modal with both meanings & relation tag visible
  await captureFrames(page, sec3Dir, 6, 500);
  const nextBtn = page.locator('.next-btn');
  await simulateClickWithRipple(page, nextBtn);
  await captureFrames(page, sec3Dir, 4, 300);

  // SECTION 4 — Results (1:20-1:45)
  console.log('Starting Section 4 — Results');
  const sec4Dir = path.join(tempDir, 'section-4');
  await showTitleCard(page, sec4Dir, 'Similarity Meter', 'Section 4');

  // Play remaining 9 questions fast
  for (let q = 2; q <= 10; q++) {
    await page.waitForSelector('.choice-btn');
    await page.locator('.choice-btn').first().click();
    await page.waitForTimeout(100);
    if (q % 2 === 0) {
      await captureFrames(page, sec4Dir, 1, 100);
    }

    await page.waitForSelector('.next-btn');
    await page.locator('.next-btn').click();
    await page.waitForTimeout(100);
  }

  await page.waitForSelector('.results-container');
  await captureFrames(page, sec4Dir, 10, 300);

  // SECTION 5 — Leaderboard (1:45-2:10)
  console.log('Starting Section 5 — Leaderboard');
  const sec5Dir = path.join(tempDir, 'section-5');
  const leaderboardNav = page.locator('nav').getByText('Leaderboard');
  await simulateClickWithRipple(page, leaderboardNav);

  await page.waitForSelector('.leaderboard-table');
  await showTitleCard(page, sec5Dir, 'Split Direction Leaderboard', 'Section 5');

  await smoothScroll(page, 200, 'down');
  await captureFrames(page, sec5Dir, 8, 300);

  const directionToggle = page.getByText('Japanese → Chinese');
  await simulateClickWithRipple(page, directionToggle);
  await captureFrames(page, sec5Dir, 8, 300);

  // SECTION 6 — Decks (2:10-2:40)
  console.log('Starting Section 6 — Decks');
  const sec6Dir = path.join(tempDir, 'section-6');
  const decksNav = page.locator('nav').getByText('My Decks');
  await simulateClickWithRipple(page, decksNav);

  await page.waitForSelector('.deck-input');
  await showTitleCard(page, sec6Dir, 'Custom Deck Builder', 'Section 6');

  const deckInput = page.locator('.deck-input').first();
  await deckInput.clear();

  const deckTitle = 'False Friend Traps';
  for (const char of deckTitle) {
    await deckInput.type(char, { delay: 80 }); // 80ms/char
  }

  await captureFrames(page, sec6Dir, 3, 300);

  const saveDeckBtn = page.locator('button').getByText('Save Deck').first();
  await simulateClickWithRipple(page, saveDeckBtn);

  await page.waitForSelector('.deck-card');
  await captureFrames(page, sec6Dir, 6, 500);

  // Close context to finish video recording
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  console.log(`Video recorded at ${videoPath}`);

  // Generate GIFs for sections 1-6 and full demo
  console.log('Generating GIFs with ffmpeg...');

  for (let s = 1; s <= 6; s++) {
    const sDir = path.join(tempDir, `section-${s}`);
    const gifOut = path.join(outputDir, `section-${s}.gif`);

    // Use ffmpeg on frame sequence
    const cmd = `ffmpeg -y -framerate 1.5 -pattern_type glob -i "${sDir}/*.png" -vf "fps=15,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${gifOut}"`;
    try {
      execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to generate GIF for section ${s}:`, e.message);
    }
  }

  // Full demo video GIF
  const fullGifOut = path.join(outputDir, 'tandem-demo.gif');
  try {
    const cmdFull = `ffmpeg -y -i "${videoPath}" -vf "fps=10,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${fullGifOut}"`;
    execSync(cmdFull, { stdio: 'inherit' });
    execSync(`gifsicle -O2 "${fullGifOut}" -o "${fullGifOut}"`, { stdio: 'inherit' });
  } catch (e) {
    console.error('Failed to generate full demo GIF:', e.message);
  }

  console.log('\n--- GIF File Size Report ---');
  const gifFiles = [
    'tandem-demo.gif',
    'section-1.gif',
    'section-2.gif',
    'section-3.gif',
    'section-4.gif',
    'section-5.gif',
    'section-6.gif',
  ];

  for (const filename of gifFiles) {
    const filePath = path.join(outputDir, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const kb = (stats.size / 1024).toFixed(2);
      console.log(`${filename}: ${kb} KB (${stats.size} bytes)`);
      if (stats.size <= 50 * 1024) {
        console.warn(`WARNING: ${filename} is NOT > 50KB!`);
      }
    } else {
      console.error(`ERROR: ${filename} was not created!`);
    }
  }

  // Cleanup temporary frame & video directories
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.rmSync(videoDir, { recursive: true, force: true });
}

runDemo().catch((err) => {
  console.error('Demo script failed:', err);
  process.exit(1);
});
