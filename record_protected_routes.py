import io
import time
from PIL import Image
from playwright.sync_api import sync_playwright

BASE_URL = "https://my-new-unrelated-project.onrender.com"
OUTPUT_GIF = "feature8-protected-routes.gif"

def main():
    frames = []
    durations = []

    def capture(page, duration_ms=200):
        screenshot_bytes = page.screenshot()
        img = Image.open(io.BytesIO(screenshot_bytes)).convert("RGB")
        frames.append(img)
        durations.append(duration_ms)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        def handle_api(route):
            url = route.request.url
            method = route.request.method
            if "/api/players" in url and method == "POST":
                route.fulfill(
                    status=201,
                    content_type="application/json",
                    body='{"id": 1, "username": "KanjiMaster", "created_at": "2026-11-01T07:00:00.000Z"}'
                )
            elif "/api/players/1" in url and method == "GET":
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body='{"id": 1, "username": "KanjiMaster", "created_at": "2026-11-01T07:00:00.000Z", "scores": [], "missed_words": []}'
                )
            elif "/api/words/round" in url:
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body='[{"id": 1, "jp_form": "手紙", "zh_simplified": "手纸", "reading_ja": "tegami", "reading_zh": "shǒuzhǐ", "meaning_ja": "letter", "meaning_zh": "toilet paper", "relationship_type": "false_friend", "options": ["letter", "newspaper", "envelope", "paper"]}]'
                )
            else:
                route.continue_()

        page.route("**/api/**", handle_api)

        # 1. Try to navigate directly to /profile — confirm it redirects to / with the message "Enter a username first."
        print("1. Navigating directly to /profile...")
        page.goto(f"{BASE_URL}/profile")
        page.wait_for_load_state("networkidle")
        assert page.url.rstrip("/") == BASE_URL.rstrip("/")
        notice = page.locator(".redirect-notice")
        notice.wait_for(state="visible")
        assert "Enter a username first." in notice.inner_text()
        print("Redirected from /profile to /")
        capture(page, duration_ms=2500)

        # 2. Try to navigate directly to /decks — same redirect behavior.
        print("2. Navigating directly to /decks...")
        page.goto(f"{BASE_URL}/decks")
        page.wait_for_load_state("networkidle")
        assert page.url.rstrip("/") == BASE_URL.rstrip("/")
        notice = page.locator(".redirect-notice")
        notice.wait_for(state="visible")
        assert "Enter a username first." in notice.inner_text()
        print("Redirected from /decks to /")
        capture(page, duration_ms=2500)

        # 3. Enter a valid username on the home page, start a game, then navigate to /profile — confirm it loads.
        print("3. Entering username...")
        username_input = page.locator("#username-input")
        username_input.click()
        capture(page, duration_ms=300)

        typed = "KanjiMaster"
        for i in range(1, len(typed) + 1):
            username_input.fill(typed[:i])
            capture(page, duration_ms=100)

        capture(page, duration_ms=600)

        print("Starting game...")
        start_btn = page.locator(".direction-buttons button.ja-btn")
        start_btn.hover()
        capture(page, duration_ms=300)
        start_btn.click()

        page.wait_for_url("**/game*")
        page.wait_for_load_state("networkidle")
        print("Game page loaded:", page.url)
        capture(page, duration_ms=1800)

        print("Navigating to /profile...")
        profile_link = page.locator("nav a[href='/profile']")
        profile_link.hover()
        capture(page, duration_ms=400)
        profile_link.click()

        page.wait_for_url("**/profile*")
        page.wait_for_load_state("networkidle")
        page.locator("h1", has_text="Player Profile").wait_for(state="visible")
        print("Profile page loaded:", page.url)
        assert page.url.endswith("/profile")
        body_text = page.locator("body").inner_text()
        assert "Enter a username first." not in body_text
        capture(page, duration_ms=3500)

        browser.close()

    print(f"Total frames: {len(frames)}, total duration: {sum(durations)}ms")
    print(f"Saving GIF to {OUTPUT_GIF}...")
    frames[0].save(
        OUTPUT_GIF,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0
    )
    print("GIF saved successfully!")

if __name__ == "__main__":
    main()
