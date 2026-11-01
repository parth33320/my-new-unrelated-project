import asyncio
import os
import shutil
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image

BASE_URL = "https://my-new-unrelated-project.onrender.com"
FRAMES_DIR = Path("temp_gif_frames")
OUTPUT_GIF = Path("feature9-loading-states.gif")

frame_idx = 0
durations = []

async def capture_frame(page, duration_ms=250):
    global frame_idx
    frame_idx += 1
    filename = FRAMES_DIR / f"frame_{frame_idx:05d}.png"
    await page.screenshot(path=str(filename))
    durations.append(duration_ms)

async def capture_frames_period(page, total_ms, interval_ms=200):
    steps = int(total_ms / interval_ms)
    for _ in range(steps):
        await capture_frame(page, interval_ms)
        await page.wait_for_timeout(interval_ms)

async def main():
    if FRAMES_DIR.exists():
        shutil.rmtree(FRAMES_DIR)
    FRAMES_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            device_scale_factor=1,
        )
        page = await context.new_page()

        # Intercept API calls to simulate realistic loading delays
        async def route_handler(route):
            url = route.request.url
            method = route.request.method
            if "/api/players" in url:
                await asyncio.sleep(2.5)
                await route.fulfill(
                    status=200,
                    content_type="application/json",
                    body='{"id": 1, "username": "KanjiMaster"}'
                )
            elif "/api/leaderboard" in url:
                await asyncio.sleep(2.5)
                await route.fulfill(
                    status=200,
                    content_type="application/json",
                    body='{"entries": [{"player_id": 1, "username": "KanjiMaster", "best_score": 95, "last_played_at": "2026-10-31T00:00:00Z"}]}'
                )
            elif "/api/decks" in url and method == "GET":
                await asyncio.sleep(2.5)
                await route.fulfill(
                    status=200,
                    content_type="application/json",
                    body='[]'
                )
            elif "/api/decks" in url and method == "POST":
                await asyncio.sleep(2.5)
                await route.fulfill(
                    status=200,
                    content_type="application/json",
                    body='{"id": 10, "player_id": 1, "deck_title": "Kanji Traps", "words": []}'
                )
            elif "/api/words" in url:
                await route.fulfill(
                    status=200,
                    content_type="application/json",
                    body='[]'
                )
            else:
                await route.continue_()

        await page.route("**/api/**", route_handler)

        # ----------------------------------------------------
        # 1. Home Page: Enter username & click start button
        # Capture Spinner appearing and buttons going disabled
        # ----------------------------------------------------
        print("Navigating to Home...")
        await page.goto(BASE_URL)
        await page.wait_for_selector("#username-input")
        await capture_frames_period(page, 600, 300)

        # Type username
        input_el = page.locator("#username-input")
        username = "KanjiMaster"
        for ch in username:
            await input_el.type(ch, delay=60)
            await capture_frame(page, 100)

        await capture_frames_period(page, 600, 300)

        # Click start button
        start_btn = page.locator(".start-btn").first
        print("Clicking start button on Home page...")
        await start_btn.click()

        # Capture loading spinner and disabled state for 2.5 seconds
        await capture_frames_period(page, 2800, 180)

        # Now game page loads or redirect
        await page.wait_for_timeout(500)
        await capture_frames_period(page, 800, 400)

        # ----------------------------------------------------
        # 2. Navigate to /leaderboard
        # Show Spinner while data loads
        # ----------------------------------------------------
        print("Navigating to /leaderboard...")
        # Click leaderboard in nav
        leaderboard_link = page.locator('nav a[href="/leaderboard"]')
        await leaderboard_link.click()

        # Capture loading spinner on leaderboard
        await capture_frames_period(page, 2800, 180)

        # Leaderboard loaded
        await page.wait_for_selector(".leaderboard-table")
        await capture_frames_period(page, 1200, 300)

        # ----------------------------------------------------
        # 3. Navigate to /decks
        # Show Spinner while decks load, and show Create button disabled/Saving during deck save
        # ----------------------------------------------------
        print("Navigating to /decks...")
        decks_link = page.locator('nav a[href="/decks"]')
        await decks_link.click()

        # Capture loading spinner on decks
        await capture_frames_period(page, 2800, 180)

        # Decks loaded
        await page.wait_for_selector(".deck-input")
        await capture_frames_period(page, 600, 300)

        # Fill deck title
        deck_input = page.locator(".deck-input").first
        deck_title = "Kanji Traps"
        for ch in deck_title:
            await deck_input.type(ch, delay=60)
            await capture_frame(page, 100)

        await capture_frames_period(page, 600, 300)

        # Click Save / Create Deck button
        save_btn = page.locator('button[type="submit"]')
        print("Clicking Save Deck button...")
        await save_btn.click()

        # Capture disabled / Saving state during deck save
        await capture_frames_period(page, 2800, 180)

        # Saved successfully (toast appears)
        await capture_frames_period(page, 1500, 300)

        await browser.close()

    print(f"Captured {frame_idx} frames. Assembling GIF...")

    # Assemble frames into GIF
    frame_files = sorted(FRAMES_DIR.glob("frame_*.png"))
    images = []
    for f in frame_files:
        img = Image.open(f)
        # Convert to RGB then quantize for optimal palette
        img = img.convert("RGB")
        # Resize slightly if needed, but 1280x720 is standard
        # To keep GIF reasonably sized and crisp:
        img_quantized = img.quantize(colors=128, method=Image.Resampling.LANCZOS, dither=Image.Dither.FLOYDSTEINBERG)
        images.append(img_quantized)

    if images:
        images[0].save(
            OUTPUT_GIF,
            save_all=True,
            append_images=images[1:],
            duration=durations,
            loop=0,
            optimize=True
        )
        print(f"GIF saved successfully: {OUTPUT_GIF} ({OUTPUT_GIF.stat().st_size / 1024:.1f} KB)")

if __name__ == "__main__":
    asyncio.run(main())
