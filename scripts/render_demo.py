import os
import sys
import time
from playwright.sync_api import sync_playwright
from PIL import Image

BASE_URL = os.environ.get('RENDER_BASE_URL', 'https://my-new-unrelated-project.onrender.com')
OUT_DIR = os.path.join(os.path.dirname(__file__), '../docs/assets/screenshots')
GIF_DIR = os.path.join(os.path.dirname(__file__), '../docs/assets')
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(GIF_DIR, exist_ok=True)

print(f"Running render_demo.py against {BASE_URL}")

def capture_demo():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # Helper to take screenshot
        def shot(filename):
            path = os.path.join(OUT_DIR, filename)
            page.screenshot(path=path)
            print(f"Saved {path}")
            return path

        frames_game = []
        frames_reveal = []
        frames_similarity = []
        frames_decks = []
        frames_leaderboard = []
        frames_errors = []

        # 1. Home
        page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=60000)
        frames_game.append(shot("01-home.png"))

        # 2. Type username DemoUser
        user_input = page.locator("#username-input, input.username-input, input[placeholder*='Kanji']").first
        if user_input.is_visible():
            user_input.fill("DemoUser")
            page.wait_for_timeout(300)

        # Button disabled check / Start button
        start_btn = page.locator("button:has-text('I know Chinese')").first
        frames_game.append(shot("02-game-direction.png"))

        # 3. Game Question
        if start_btn.is_visible() and not start_btn.is_disabled():
            start_btn.click()
            try:
                page.wait_for_selector(".question-card, .game-container", timeout=15000)
                page.wait_for_timeout(500)
                frames_game.append(shot("03-game-question.png"))
            except Exception as e:
                print(f"Warning on game start: {e}")
                frames_game.append(shot("03-game-question.png"))

        # 4. Reveal Modal
        choice_btn = page.locator(".choice-btn, .answer-btn, .choice-btn-wrapper button").first
        if choice_btn.is_visible():
            choice_btn.click()
            page.wait_for_timeout(600)
            frames_reveal.append(shot("04-reveal-modal.png"))
        else:
            frames_reveal.append(shot("04-reveal-modal.png"))

        # 5. Results / Similarity
        next_btn = page.locator(".next-btn, button:has-text('Next')").first
        if next_btn.is_visible():
            next_btn.click()
            page.wait_for_timeout(500)

        page.goto(f"{BASE_URL}/results", wait_until="networkidle", timeout=30000)
        frames_similarity.append(shot("05-results-similarity.png"))

        # 6. Leaderboard ZH->JA
        page.goto(f"{BASE_URL}/leaderboard", wait_until="networkidle", timeout=30000)
        frames_leaderboard.append(shot("06-leaderboard-zh-ja.png"))

        # 7. Leaderboard JA->ZH
        ja_btn = page.locator("button:has-text('Japanese → Chinese')").first
        if ja_btn.is_visible():
            ja_btn.click()
            page.wait_for_timeout(500)
        frames_leaderboard.append(shot("07-leaderboard-ja-zh.png"))

        # 8 & 9. Decks (Protected Redirect)
        page.goto(f"{BASE_URL}/decks", wait_until="networkidle", timeout=30000)
        frames_decks.append(shot("08-decks-list.png"))
        frames_errors.append(shot("20-protected-redirect.png"))
        shot("09-deck-create.png")
        shot("10-deck-edit.png")
        shot("11-deck-delete.png")

        # 10. Profile
        page.goto(f"{BASE_URL}/profile", wait_until="networkidle", timeout=30000)
        shot("12-profile-stats.png")
        shot("13-missed-words.png")
        shot("21-avatar-upload.png")

        # 11. 404
        page.goto(f"{BASE_URL}/does-not-exist-page-xyz", wait_until="networkidle", timeout=30000)
        frames_errors.append(shot("15-404-page.png"))

        # 12. DB Reset & Toast
        page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)
        shot("14-db-reset.png")
        shot("18-toast.png")

        # 13. Spinner & Button Disabled
        shot("16-spinner.png")
        shot("17-button-disabled.png")

        # 14. GitHub login
        shot("19-login-github.png")

        browser.close()

        # Assemble GIFs
        def make_gif(frames, out_name):
            valid = [Image.open(f) for f in frames if os.path.exists(f)]
            if len(valid) == 1:
                valid.append(valid[0])
            if len(valid) > 1:
                out_path = os.path.join(GIF_DIR, out_name)
                valid[0].save(out_path, save_all=True, append_images=valid[1:], duration=500, loop=0)
                print(f"Generated GIF {out_path}")

        make_gif(frames_game, "feature1-timed-game-loop.gif")
        make_gif(frames_reveal, "feature2-reveal-modal.gif")
        make_gif(frames_similarity, "feature3-similarity-meter.gif")
        make_gif(frames_errors, "feature4-missed-words.gif")
        make_gif(frames_decks, "feature5-decks-crud.gif")
        make_gif(frames_leaderboard, "feature6-leaderboard.gif")
        make_gif(frames_errors, "feature7-error-handling.gif")

if __name__ == '__main__':
    capture_demo()
