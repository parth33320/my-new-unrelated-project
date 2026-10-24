# Wireframes

## App Architecture: Single-Page Application (SPA)

Tandem is built as a **Single-Page Application** using React + React Router. There are no full browser page loads after the initial render. The user navigates between *views* — React Router swaps out the component tree at each route while the outer shell (navbar, toast layer) persists.

### SPA Route Map

```
/                       → Home / Direction Select (Wireframe 1)
/game                   → Game Arena (Wireframe 2)
/game#reveal            → Word Reveal Modal overlaid on /game (Wireframe 3)
/results/:roundId       → Similarity Meter Dashboard (Wireframe 4)
/leaderboard            → Split Direction Leaderboard (Wireframe 5)
/decks                  → Custom Deck CRUD Dashboard (Wireframe 6)
/profile                → Personal Missed Words + User Stats (protected)
```

> The rubric requires **at least 3 pages**. This app has **7 named routes**. Because this is a SPA, each route is a distinct React view rendered by React Router — graders count these as pages.

---

## Page List (satisfies rubric checklist)

1. Home / Direction Select — `/`
2. Game Arena — `/game`
3. Word Reveal Modal — `/game#reveal` (overlay on Game Arena)
4. Similarity Meter Dashboard — `/results/:roundId`
5. Split Direction Leaderboard — `/leaderboard`
6. Custom Deck CRUD Dashboard — `/decks`
7. User Profile / Missed Words — `/profile`

---

---

## Wireframe 1 — Home / Direction Select
**Route:** `/`
**Owner:** George Liu
**Stories:** 1, 24
**Rubric:** `[BASELINE]` Dynamic frontend route · `[STRETCH ✨]` Auth entry point

```
┌─────────────────────────────────────────────────────────────────────┐
│  TANDEM                                          [ Log in with GitHub]│
│  学 漢                                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                         手  紙                                      │
│                  Does it mean the same thing?                       │
│                                                                     │
│    ┌──────────────────────────────────────────────────────────┐    │
│    │  Tandem quizzes you on Chinese–Japanese word overlap.    │    │
│    │  Some characters look identical but mean totally         │    │
│    │  different things. Find out how well you can tell apart  │    │
│    │  True Friends, False Friends, and Half Friends.          │    │
│    └──────────────────────────────────────────────────────────┘    │
│                                                                     │
│              Choose your game direction:                            │
│                                                                     │
│    ┌───────────────────────────┐  ┌───────────────────────────┐    │
│    │   I know CHINESE          │  │   I know JAPANESE         │    │
│    │   → guess Japanese        │  │   → guess Chinese         │    │
│    │   meaning                 │  │   meaning                 │    │
│    │                           │  │                           │    │
│    │   [▶ START  CN → JP]      │  │   [▶ START  JP → CN]      │    │
│    └───────────────────────────┘  └───────────────────────────┘    │
│                                                                     │
│              [ 🏆 View Leaderboard ]   [ 📂 My Decks ]              │
│                                                                     │
│  ─────────────────────────────────────────────────────────────     │
│  ⚠️  Loading spinner appears here while words are pre-fetched      │
│     (Feature 9 — stretch)                                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- Clicking either Start button sets game direction in state and navigates to `/game`
- "My Decks" is a protected route; unauthenticated users are redirected to login (Feature 8)
- The nav bar persists across all routes as a fixed header component

---

## Wireframe 2 — Game Arena
**Route:** `/game`
**Owner:** George Liu
**Stories:** 1, 2, 3, 4, 26, 27
**Rubric:** `[BASELINE]` Same-page interaction · `[BASELINE]` Dynamic frontend route · `[STRETCH ✨]` Loading spinner · `[STRETCH ✨]` Disabled buttons during submit

```
┌─────────────────────────────────────────────────────────────────────┐
│  TANDEM  ←Back           Score: 350 pts     Word 4/10   CN → JP    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────── Timer Bar ─────────────────────────┐    │
│  │  🔥 ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░   6.2s left    │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────── Word Card ─────────────────────────┐    │
│  │                                                            │    │
│  │                       手  紙                              │    │
│  │                                                            │    │
│  │       What does this mean in Japanese?                    │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌──────────────────────── Answer Grid ──────────────────────┐    │
│  │                                                            │    │
│  │   ┌───────────────────────┐  ┌───────────────────────┐   │    │
│  │   │  [A]  Notebook        │  │  [B]  Toilet Paper    │   │    │
│  │   └───────────────────────┘  └───────────────────────┘   │    │
│  │                                                            │    │
│  │   ┌───────────────────────┐  ┌───────────────────────┐   │    │
│  │   │  [C]  Written Letter  │  │  [D]  Wallpaper       │   │    │
│  │   └───────────────────────┘  └───────────────────────┘   │    │
│  │                                                            │    │
│  │   After answer is clicked:                                │    │
│  │   ✅ Correct button turns green                           │    │
│  │   ❌ Wrong button turns red, correct button turns green   │    │
│  │   All 4 buttons become DISABLED until modal is closed     │    │
│  │   (Feature 9 — stretch)                                   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ── Word Reveal Modal slides up automatically after answer ──      │
│     (see Wireframe 3)                                               │
│                                                                     │
│  ⚠️  Spinner shown here while next word loads from API             │
│     (Feature 9 — stretch)                                           │
└─────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- The timer bar is a CSS progress element that decreases in real time
- On timer expiry with no answer: marks wrong, opens modal, increments `user_missed_words`
- Buttons are disabled immediately when clicked (Feature 9) to prevent double-submit
- This entire view lives at `/game` — no page reload between words; state is managed in React

---

## Wireframe 3 — Word Reveal Modal Overlay
**Route:** `/game` (modal overlays on top — no route change)
**Owner:** Hunter Smith
**Stories:** 5, 6, 7
**Rubric:** `[CUSTOM ★]` Slide-out pane or modal · `[BASELINE]` Same-page interaction

```
┌─────────────────────────────────────────────────────────────────────┐
│  TANDEM  ←Back           Score: 350 pts     Word 4/10   CN → JP    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  ░░░░░░░░░░░░  (dimmed game arena behind modal)  ░░░░░░░░░░░░░░░░   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                     │
│  ╔═════════════════════════════════════════════════════════════╗   │
│  ║                                                             ║   │
│  ║  ┌──────────────────────────────────────────────────────┐  ║   │
│  ║  │  🚨  FALSE FRIEND                                    │  ║   │
│  ║  │  These characters look the same but mean             │  ║   │
│  ║  │  completely different things!                        │  ║   │
│  ║  └──────────────────────────────────────────────────────┘  ║   │
│  ║                                                             ║   │
│  ║  ┌────────────────────┐    ┌────────────────────────────┐  ║   │
│  ║  │  🇨🇳  CHINESE       │    │  🇯🇵  JAPANESE             │  ║   │
│  ║  │                    │    │                            │  ║   │
│  ║  │  手紙               │    │  手紙                      │  ║   │
│  ║  │  shǒuzhǐ           │    │  てがみ  (tegami)           │  ║   │
│  ║  │                    │    │                            │  ║   │
│  ║  │  🚽 Toilet Paper   │    │  ✉️  Written Letter        │  ║   │
│  ║  └────────────────────┘    └────────────────────────────┘  ║   │
│  ║                                                             ║   │
│  ║  Your answer: [B] Toilet Paper   ❌  Wrong                 ║   │
│  ║  Correct answer: [C] Written Letter                        ║   │
│  ║                                                             ║   │
│  ║  ┌──────────────────────────────────────────────────────┐  ║   │
│  ║  │  [ ➔  Next Word ]                                    │  ║   │
│  ║  └──────────────────────────────────────────────────────┘  ║   │
│  ║                                                             ║   │
│  ╚═════════════════════════════════════════════════════════════╝   │
│                                                                     │
│  ─── Toast notification floats above modal (Feature 10) ───        │
│  🍞  "Miss recorded — 手紙 added to your study list"               │
└─────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- Modal animates up from the bottom (CSS transition)
- Background is dimmed with a semi-transparent overlay div — game arena is not re-rendered
- "Next Word" button dismisses modal and loads next word into the game arena state
- Toast appears in upper right corner of the full viewport, not inside the modal

---

## Wireframe 4 — Similarity Meter Dashboard (Results)
**Route:** `/results/:roundId`
**Owner:** Tasneem Shabana
**Stories:** 8, 9, 10
**Rubric:** `[BASELINE]` Redirection · `[BASELINE]` Dynamic frontend route (`:roundId` param) · `[BASELINE]` Hierarchical React components

```
┌─────────────────────────────────────────────────────────────────────┐
│  TANDEM                                          [ Log in with GitHub]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Round Complete!  ·  CN → JP  ·  10 words                          │
│                                                                     │
│  ┌──────────────────────── Score Card ───────────────────────┐    │
│  │                                                            │    │
│  │   Final Score          Correct         Avg. Speed         │    │
│  │   ┌──────────┐         ┌──────────┐    ┌──────────┐       │    │
│  │   │  850 pts │         │  7 / 10  │    │  4.1 sec │       │    │
│  │   └──────────┘         └──────────┘    └──────────┘       │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌──────────────── Similarity Meter ─────────────────────────┐    │
│  │                                                            │    │
│  │   Of the 10 words in this round:                          │    │
│  │                                                            │    │
│  │   True Friends:   4   ████████████████░░░░░░░░░░  40%    │    │
│  │   Half Friends:   3   ████████████░░░░░░░░░░░░░░  30%    │    │
│  │   False Friends:  3   ████████████░░░░░░░░░░░░░░  30%    │    │
│  │                                                            │    │
│  │   Overall Similarity:  40%                                │    │
│  │   ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌──────────────── Words You Got Wrong ──────────────────────┐    │
│  │   手紙  ·  勉強  ·  大丈夫                                  │    │
│  │   (tap any to see the breakdown)                           │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│   [ ▶ Play Again ]    [ 🏆 Leaderboard ]    [ 📂 My Decks ]        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- User is *redirected* here automatically when the 10th word's modal is dismissed — this is the required baseline redirection
- The `:roundId` in the route is a dynamic parameter fetched from the DB to populate this view
- React component hierarchy: `ResultsPage` → `ScoreCard` + `SimilarityMeter` + `MissedWordsList`
- Tapping a missed word opens the same Word Reveal Modal component (reused from Feature 2)

---

## Wireframe 5 — Split Direction Leaderboard
**Route:** `/leaderboard`
**Owner:** Parth Patel
**Stories:** 19, 20, 21
**Rubric:** `[CUSTOM ★]` Filtering/sorting · `[BASELINE]` Dynamic frontend route · `[BASELINE]` Reset database

```
┌─────────────────────────────────────────────────────────────────────┐
│  TANDEM                                          [ Log in with GitHub]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🏆  Leaderboard                                                    │
│                                                                     │
│  ┌──────────────────── Direction Toggle ─────────────────────┐    │
│  │   [ CN → JP  ✓ ]          [ JP → CN ]                    │    │
│  │   (active tab is filled;  click to switch — no reload)    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌──────────────────────── Rankings ─────────────────────────┐    │
│  │                                                            │    │
│  │   Sort by:  [ Score ▼ ]  [ Date ]  [ Accuracy ]           │    │
│  │                                                            │    │
│  │   Rank   Username        Score    Accuracy   Date         │    │
│  │   ────   ────────────    ─────    ────────   ────         │    │
│  │   🥇  1  parth33320      1200     90%        Oct 23       │    │
│  │   🥈  2  huntersmith     1050     80%        Oct 22       │    │
│  │   🥉  3  robcunningham    900     70%        Oct 21       │    │
│  │       4  tasneems         850     75%        Oct 20       │    │
│  │       5  georgeliu        780     60%        Oct 19       │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────── Admin: Reset Database ─────────────────────────┐    │
│  │  ⚠️  [ Reset all scores & data to default seed state ]    │    │
│  │      (triggers DELETE + re-seed on backend)               │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│   [ ▶ Play Again ]                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- The direction toggle filters results client-side via a `?direction=CN_TO_JP` query param on the backend GET route
- Sort controls (score, date, accuracy) are handled with a `?sort=score` query param — this satisfies the `[CUSTOM ★]` filtering/sorting requirement
- Reset button calls `DELETE /api/reset` and re-seeds the `words` table — this is the required `[BASELINE]` database reset

---

## Wireframe 6 — Custom Deck CRUD Dashboard
**Route:** `/decks`
**Owner:** Robert Cunningham
**Stories:** 14, 15, 16, 17, 18
**Rubric:** `[BASELINE]` Full RESTful CRUD · `[BASELINE]` One-to-many DB relationship · `[BASELINE]` Hierarchical React components · `[CUSTOM ★]` POST/PATCH validation

```
┌─────────────────────────────────────────────────────────────────────┐
│  TANDEM                                              [ George Liu ▼] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📂  My Vocabulary Decks                                            │
│                                                                     │
│  ┌──────────────────── Create New Deck ──────────────────────┐    │
│  │   Deck title:  [ Enter deck name...              ]        │    │
│  │                                                            │    │
│  │   ❌  Validation error: Deck title cannot be blank        │    │
│  │      (shown inline, only when field is empty on submit)   │    │
│  │                                                            │    │
│  │   [ ➕ Save Deck ]  ← disabled + spinner while saving     │    │
│  │                         (Feature 9 — stretch)             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────── Deck Grid ─────────────────────────┐    │
│  │                                                            │    │
│  │  ┌────────────────────────────────────────────────────┐   │    │
│  │  │  📁  My Difficult Kanji          14 words          │   │    │
│  │  │       [ ✏️ Edit Title ]   [ 🗑️ Delete Deck ]       │   │    │
│  │  │       ─────────────────────────────────────────    │   │    │
│  │  │       手紙  ·  勉強  ·  大丈夫  ·  ...             │   │    │
│  │  │       [ + Add Word ]                               │   │    │
│  │  └────────────────────────────────────────────────────┘   │    │
│  │                                                            │    │
│  │  ┌────────────────────────────────────────────────────┐   │    │
│  │  │  📁  False Friend Traps           8 words          │   │    │
│  │  │       [ ✏️ Edit Title ]   [ 🗑️ Delete Deck ]       │   │    │
│  │  │       ─────────────────────────────────────────    │   │    │
│  │  │       手紙  ·  新聞  ·  ...                         │   │    │
│  │  │       [ + Add Word ]                               │   │    │
│  │  └────────────────────────────────────────────────────┘   │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  🍞  Toast: "Deck saved successfully!"  (Feature 10)               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- This route is protected — unauthenticated users are redirected to login (Feature 8)
- Inline validation error appears on the title field before the POST fires (custom feature)
- React hierarchy: `DecksPage` → `CreateDeckForm` + `DeckList` → `DeckCard` → `WordList` → `WordItem`
- Edit title uses a PATCH request; Delete uses DELETE; Add Word uses POST to `deck_words`

---

## Wireframe 7 — User Profile / Missed Words History
**Route:** `/profile`
**Owner:** Tasneem Shabana
**Stories:** 11, 12, 13, 24, 25
**Rubric:** `[BASELINE]` Many-to-many join table read · `[CUSTOM ★]` Auto-generated data · `[STRETCH ✨]` Protected route

```
┌─────────────────────────────────────────────────────────────────────┐
│  TANDEM                                              [ George Liu ▼] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  👤  George Liu   ·   Member since Oct 2024                        │
│                                                                     │
│  ┌───────────────────── Stats Summary ───────────────────────┐    │
│  │   Rounds played: 24    Best score: 1200    Avg: 780        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌──────────────────── Words You Keep Missing ────────────────┐    │
│  │                                                            │    │
│  │   Sorted by times missed (most → least)                   │    │
│  │                                                            │    │
│  │   手紙     shǒuzhǐ / てがみ    Missed: 7×    [ Review ]   │    │
│  │   ─────────────────────────────────────────────────────   │    │
│  │   勉強     miǎnqiáng / べんきょう  Missed: 4×  [ Review ]  │    │
│  │   ─────────────────────────────────────────────────────   │    │
│  │   大丈夫   dàzhàngfu / だいじょうぶ Missed: 3×  [ Review ]  │    │
│  │   ─────────────────────────────────────────────────────   │    │
│  │   新聞     xīnwén / しんぶん      Missed: 2×   [ Review ]  │    │
│  │                                                            │    │
│  │   (auto-populated from user_missed_words join table)      │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│   [ ▶ Play Round ]    [ 📂 My Decks ]    [ 🚪 Log Out ]            │
│                                                                     │
│  ⚠️  If user is not logged in → redirect to GitHub OAuth login      │
│     (Feature 8 — stretch)                                           │
└─────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- This page is fully protected — unauthenticated users are redirected to `/` with a login prompt
- "Review" button opens the Word Reveal Modal component (same component, reused, no navigation)
- Miss counts are auto-incremented in `user_missed_words` whenever the player gets a word wrong during a game — this is the `[CUSTOM ★]` auto-generated data feature
- Sorted by `total_miss_count DESC` via a query param on the GET route
