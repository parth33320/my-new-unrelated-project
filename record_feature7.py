import os
import shutil
from playwright.sync_api import sync_playwright
from PIL import Image

BASE_URL = "https://my-new-unrelated-project.onrender.com"
FRAMES_DIR = "/tmp/feature7_frames"
OUTPUT_GIF = "feature7-error-handling.gif"
DOCS_GIF = "docs/assets/feature7-error-handling.gif"

def setup_frames_dir():
    if os.path.exists(FRAMES_DIR):
        shutil.rmtree(FRAMES_DIR)
    os.makedirs(FRAMES_DIR, exist_ok=True)

def record_scenario():
    setup_frames_dir()
    frame_index = 0
    frame_paths = []
    durations = []

    def capture_frame(page, duration_ms=400):
        nonlocal frame_index
        frame_index += 1
        fpath = os.path.join(FRAMES_DIR, f"frame_{frame_index:04d}.png")
        page.screenshot(path=fpath)
        frame_paths.append(fpath)
        durations.append(duration_ms)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-web-security", "--no-sandbox"]
        )
        context = browser.new_context(
            viewport={"width": 1280, "height": 720}
        )
        page = context.new_page()

        print("1. Navigate to /profile without entering a username first...")
        page.goto(f"{BASE_URL}/profile", wait_until="networkidle")
        page.wait_for_timeout(1000)

        # Verify redirect occurred to /
        print(f"Current page URL after redirect: {page.url}")
        page.wait_for_selector(".redirect-notice", state="visible", timeout=5000)
        print("Redirect notice displayed:", page.locator(".redirect-notice").inner_text())

        # Capture initial redirected state
        for _ in range(6):
            capture_frame(page, duration_ms=400)
            page.wait_for_timeout(200)

        print("2. On the home page, enter a 1-character username and click start...")
        username_input = page.locator("#username-input")
        username_input.focus()
        for _ in range(2):
            capture_frame(page, duration_ms=300)

        # Type character 'a'
        username_input.type("a", delay=150)
        for _ in range(3):
            capture_frame(page, duration_ms=300)

        # Add visual click effect or ripple on start button before triggering validation
        page.evaluate('''() => {
            const btn = document.querySelector('.start-btn.ja-btn');
            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('div');
            ripple.style.position = 'fixed';
            ripple.style.left = (rect.left + rect.width / 2) + 'px';
            ripple.style.top = (rect.top + rect.height / 2) + 'px';
            ripple.style.width = '36px';
            ripple.style.height = '36px';
            ripple.style.marginLeft = '-18px';
            ripple.style.marginTop = '-18px';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = 'rgba(239, 68, 68, 0.5)';
            ripple.style.border = '2px solid rgba(239, 68, 68, 0.9)';
            ripple.style.pointerEvents = 'none';
            ripple.style.zIndex = '999999';
            document.body.appendChild(ripple);
        }''')
        capture_frame(page, duration_ms=300)

        # Trigger handleStart onClick
        page.evaluate('''() => {
            const btn = document.querySelector('.start-btn.ja-btn');
            const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps$'));
            if (btn[propKey] && btn[propKey].onClick) {
                btn[propKey].onClick();
            }
            const rip = document.querySelector('div[style*="rgba(239, 68, 68"]');
            if (rip) rip.remove();
        }''')
        page.wait_for_selector(".error-text", state="visible", timeout=5000)
        print("Validation error displayed:", page.locator(".error-text").inner_text())

        for _ in range(6):
            capture_frame(page, duration_ms=400)
            page.wait_for_timeout(200)

        print("3. Navigate to /leaderboard and confirm it loads without crashing...")
        leaderboard_link = page.locator("nav >> text=Leaderboard")
        leaderboard_link.click()
        page.wait_for_url("**/leaderboard", timeout=5000)
        page.wait_for_selector(".empty-msg, .leaderboard-table", state="visible", timeout=10000)
        print("Leaderboard loaded successfully. Current URL:", page.url)

        for _ in range(7):
            capture_frame(page, duration_ms=400)
            page.wait_for_timeout(200)

        browser.close()

    print(f"Compiling {len(frame_paths)} frames into GIF...")
    # Convert frames using PIL with optimal palette
    images = [Image.open(fp).convert("RGB") for fp in frame_paths]

    # Save root GIF
    images[0].save(
        OUTPUT_GIF,
        save_all=True,
        append_images=images[1:],
        duration=durations,
        loop=0
    )
    print(f"Generated {OUTPUT_GIF} ({os.path.getsize(OUTPUT_GIF) / 1024:.1f} KB)")

    # Also save to docs/assets/
    images[0].save(
        DOCS_GIF,
        save_all=True,
        append_images=images[1:],
        duration=durations,
        loop=0
    )
    print(f"Generated {DOCS_GIF} ({os.path.getsize(DOCS_GIF) / 1024:.1f} KB)")

if __name__ == "__main__":
    record_scenario()
