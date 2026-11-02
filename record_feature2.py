import asyncio
import os
import shutil
import time
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image

BASE_URL = "http://localhost:3001"
FRAMES_DIR = Path("temp_f2_frames")
OUTPUT_GIF_TANDEM = Path("tandem/docs/gifs/feature2-reveal-modal.gif")
OUTPUT_GIF_DOCS = Path("docs/assets/feature2-reveal-modal.gif")

frame_idx = 0
durations = []

async def capture_frame(page, duration_ms=250):
    global frame_idx
    frame_idx += 1
    filename = FRAMES_DIR / f"frame_{frame_idx:05d}.png"
    await page.screenshot(path=str(filename))
    durations.append(duration_ms)

async def capture_frames_period(page, total_ms, interval_ms=200):
    steps = max(1, int(total_ms / interval_ms))
    for _ in range(steps):
        await capture_frame(page, interval_ms)
        await page.wait_for_timeout(interval_ms)

async def simulate_click(page, locator):
    await locator.scroll_into_view_if_needed()
    box = await locator.bounding_box()
    if box:
        x = box["x"] + box["width"] / 2
        y = box["y"] + box["height"] / 2
        await page.evaluate(
            """({x, y}) => {
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
            }""",
            {"x": x, "y": y},
        )
        await capture_frames_period(page, 200, 100)
    await locator.click()

async def main():
    if FRAMES_DIR.exists():
        shutil.rmtree(FRAMES_DIR)
    FRAMES_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_GIF_TANDEM.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_GIF_DOCS.parent.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            device_scale_factor=1,
        )
        page = await context.new_page()

        # Let's route /api/words/round to return a 3-question round so playing 3 questions reaches Results page
        original_route = page.route
        async def handle_round_route(route):
            url = route.request.url
            if "/api/words/round" in url:
                # fetch real round from server, but slice to 3 questions so last question leads to Results
                response = await page.request.fetch(route.request)
                json_data = await response.json()
                if "questions" in json_data and len(json_data["questions"]) > 3:
                    json_data["questions"] = json_data["questions"][:3]
                await route.fulfill(
                    status=response.status,
                    headers=response.headers,
                    body=json_data if isinstance(json_data, str) else str(json_data).replace("'", '"')
                )
            else:
                await route.continue_()

        # Custom mock or response interception for 3 questions
        async def intercept_round(route):
            req = route.request
            if "/api/words/round" in req.url:
                resp = await context.request.get(req.url)
                data = await resp.json()
                if "questions" in data:
                    data["questions"] = data["questions"][:3]
                import json
                await route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps(data)
                )
            else:
                await route.continue_()

        await page.route("**/api/words/round*", intercept_round)

        print("Navigating to local Tandem server at http://localhost:3001...")
        await page.goto(BASE_URL, wait_until="networkidle")
        await page.wait_for_selector("#username-input")
        await capture_frames_period(page, 500, 250)

        # Step 1: Enter username
        print("Typing username...")
        username_input = page.locator("#username-input")
        username = f"Revealer{int(time.time()) % 1000}"
        for ch in username:
            await username_input.type(ch, delay=80)
            await capture_frame(page, 80)

        await capture_frames_period(page, 400, 200)

        # Step 2: Pick direction
        print("Selecting direction: I know Chinese -> guess Japanese...")
        start_btn = page.locator(".start-btn.ja-btn")
        await simulate_click(page, start_btn)

        # Wait for Game page to load
        print("Waiting for game page...")
        await page.wait_for_selector(".question-card", timeout=15000)
        await page.wait_for_selector(".timer-container")
        await capture_frames_period(page, 800, 200)

        # Play through 3 questions
        for q_num in range(1, 4):
            print(f"--- Playing Question {q_num} ---")
            # Wait for choices to appear
            await page.wait_for_selector(".choice-btn:not([disabled])", timeout=10000)
            await capture_frames_period(page, 500, 250)

            # Pick a choice (e.g. the first choice)
            choice_btn = page.locator(".choice-btn").first
            print(f"Clicking answer for Question {q_num}...")
            await simulate_click(page, choice_btn)

            # Wait for RevealCard modal to appear
            print(f"Waiting for RevealCard modal on Question {q_num}...")
            await page.wait_for_selector(".reveal-modal-card", state="visible", timeout=10000)

            # Let user view the modal (spelling, readings, meanings, relation tag)
            await capture_frames_period(page, 1500, 250)

            # Click modal Next button ("Next Question →" or "View Results →")
            next_btn = page.locator(".next-btn")
            print(f"Clicking next button on modal for Question {q_num}...")
            await simulate_click(page, next_btn)
            await capture_frames_period(page, 400, 200)

        # Reach Results page
        print("Waiting for Results page...")
        await page.wait_for_selector(".results-card", timeout=15000)
        await capture_frames_period(page, 1500, 300)

        await browser.close()

    print(f"Total frames captured: {frame_idx}. Assembling GIF...")
    frame_files = sorted(FRAMES_DIR.glob("frame_*.png"))
    images = []
    for f in frame_files:
        img = Image.open(f)
        img = img.convert("RGB")
        # Resize to 960x540 to keep gif file size fast and efficient while crisp
        img_resized = img.resize((960, 540), Image.Resampling.LANCZOS)
        img_quantized = img_resized.quantize(colors=128, method=Image.Resampling.LANCZOS, dither=Image.Dither.FLOYDSTEINBERG)
        images.append(img_quantized)

    if images:
        images[0].save(
            str(OUTPUT_GIF_TANDEM),
            save_all=True,
            append_images=images[1:],
            duration=durations,
            loop=0,
            optimize=True
        )
        print(f"GIF saved to {OUTPUT_GIF_TANDEM} ({OUTPUT_GIF_TANDEM.stat().st_size / 1024:.1f} KB)")
        shutil.copyfile(OUTPUT_GIF_TANDEM, OUTPUT_GIF_DOCS)
        print(f"GIF copied to {OUTPUT_GIF_DOCS}")

    # Cleanup frames
    shutil.rmtree(FRAMES_DIR)
    print("Cleaned up frames directory.")

if __name__ == "__main__":
    asyncio.run(main())
