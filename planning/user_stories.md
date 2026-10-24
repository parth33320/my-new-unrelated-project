# Tandem — User Stories

> **How to read this file**
>
> Every story is tagged with:
> - The **rubric category** it contributes to (Baseline Required / Custom Required / Stretch)
> - The **Final Milestone point value** from the course rubric
> - The **app feature** it belongs to
> - The **owner** responsible for implementing it
>
> Tags use this format:
> `[BASELINE — X pts]` · `[CUSTOM — 3 pts]` · `[STRETCH — X pts]`
>
> Point values come from the Final Milestone rubric (65 pts baseline + 24 pts custom + 19 pts stretch).

---

## User Roles

| # | Role | Description |
|---|------|-------------|
| 1 | **Player** | A language learner who plays quiz rounds to test knowledge of Chinese/Japanese word overlap |
| 2 | **Registered User** | A logged-in Player who can save progress, build custom decks, and appear on leaderboards |
| 3 | **Admin** | A developer or content curator who can manage the word database |

---

## Rubric Coverage Summary

| Rubric Category | Item | Points | Covered by Feature(s) |
|---|---|---|---|
| **BASELINE** | Express backend + React frontend | 5 | All features |
| **BASELINE** | One-to-many DB relationship | 8 (shared) | Custom Deck Creator |
| **BASELINE** | Many-to-many with join table | 8 (shared) | Personal Missed Words History |
| **BASELINE** | RESTful API (GET/POST/PATCH/DELETE) | 15 | Custom Deck Creator (full CRUD) |
| **BASELINE** | Reset database to default | 4 | Split Direction Leaderboards |
| **BASELINE** | At least one redirection | 3 | Final Similarity Meter Dashboard |
| **BASELINE** | At least one same-page interaction | 3 | Timed Game Loop / Word Reveal Cards |
| **BASELINE** | Dynamic frontend routes (React Router) | 4 | Game Loop, Results, Deck Dashboard |
| **BASELINE** | Hierarchical React components | 6 | Custom Deck Creator |
| **BASELINE** | Dynamic routes frontend + backend | 3 | All features |
| **BASELINE** | Deployed on Render, all features working | 8 | All features |
| **CUSTOM** | Slide-out pane or modal | 3 | Dynamic Word Reveal Cards |
| **CUSTOM** | Filtering and/or sorting | 3 | Split Direction Leaderboards |
| **CUSTOM** | Data auto-generated on event | 3 | Personal Missed Words History |
| **CUSTOM** | POST/PATCH data validated before DB update | 3 | Custom Deck Creator |
| **CUSTOM** | Unique field within join table | 3 | Personal Missed Words History |
| **CUSTOM** | Graceful error handling | 3 | Error Handling (all features) |
| **STRETCH** | Login required for subset of pages | 3 | Auth / Protected Routes feature |
| **STRETCH** | Show spinner while loading | 2 | Loading States feature |
| **STRETCH** | Disable buttons during form submission | 2 | Loading States feature |
| **STRETCH** | Toast messages on user events | 3 | Toast Notifications feature |

---

---

# FEATURE 1 — Timed Game Loop Mode
**Owner: George Liu**
**Rubric contributions:** Baseline — same-page interaction (3 pts), dynamic frontend routes (4 pts), dynamic backend routes (part of 3 pts), Express + React (part of 5 pts)

> The core quiz game: choose a direction, see a word, pick the answer before the timer runs out.

### Story 1
`[BASELINE — contributes to: same-page interaction 3 pts, dynamic frontend routes 4 pts]`

As a **player**, I want to choose a game direction (Chinese → Japanese or Japanese → Chinese) on a setup screen so that I can practice in the direction that matches my learning goal.

### Story 2
`[BASELINE — contributes to: same-page interaction 3 pts, dynamic backend routes part of 3 pts]`

As a **player**, I want to see a word displayed on the game screen with a visual countdown timer so that I know how much time I have left to answer.

### Story 3
`[BASELINE — contributes to: same-page interaction 3 pts]`

As a **player**, I want the timer to stop and my answer to be recorded as soon as I click a multiple-choice option so that the game does not continue counting after I have responded.

### Story 4
`[BASELINE — contributes to: RESTful API GET part of 15 pts]`

As a **player**, I want to see whether my answer was correct or incorrect immediately after clicking so that I can learn from my mistakes in real time without leaving the game page.

---

# FEATURE 2 — Dynamic Word Reveal Cards
**Owner: Hunter Smith**
**Rubric contributions:** Custom Required — slide-out pane or modal (3 pts), Baseline — same-page interaction (3 pts, shared with Feature 1)

> After each answer, a modal card shows the full side-by-side linguistic breakdown and relationship tag for the word.

### Story 5
`[CUSTOM — slide-out pane or modal: 3 pts]`
`[BASELINE — same-page interaction: 3 pts]`

As a **player**, I want a modal card to appear on top of the current game screen after each answer so that I can see the full Chinese and Japanese breakdown of the word without navigating away from the game.

### Story 6
`[CUSTOM — slide-out pane or modal: 3 pts]`
`[BASELINE — contributes to: RESTful API GET part of 15 pts]`

As a **player**, I want the modal to display the word spelling, pronunciation, English meaning, and relationship tag (True Friend / False Friend / Half Friend) for both languages so that I understand exactly why the languages matched or did not match.

### Story 7
`[BASELINE — same-page interaction: 3 pts]`

As a **player**, I want to close the modal with a button and immediately see the next question so that the game flow continues smoothly.

---

# FEATURE 3 — Final Similarity Meter Dashboard
**Owner: Tasneem Shabana**
**Rubric contributions:** Baseline — at least one redirection (3 pts), dynamic frontend routes (part of 4 pts), custom non-RESTful route (part of Custom 3 pts if selected)

> After a quiz round ends, the player is redirected to a results screen showing their score and a similarity percentage bar.

### Story 8
`[BASELINE — at least one redirection: 3 pts, dynamic frontend routes part of 4 pts]`

As a **player**, I want to be automatically redirected to a results screen after answering the final question in a round so that I do not have to navigate there manually.

### Story 9
`[BASELINE — contributes to: RESTful API GET part of 15 pts, dynamic backend routes part of 3 pts]`

As a **player**, I want to see a similarity meter on the results screen that shows what percentage of the words in my round were True Friends so that I understand how much Chinese and Japanese overlapped in that session.

### Story 10
`[BASELINE — contributes to: hierarchical React components part of 6 pts]`

As a **player**, I want to see my total score, number of correct answers, and average answer speed displayed alongside the similarity meter so that I have a complete summary of the round in one place.

---

# FEATURE 4 — Personal Missed Words History
**Owner: Tasneem Shabana**
**Rubric contributions:** Baseline — many-to-many with join table (part of 8 pts); Custom Required — data auto-generated on event (3 pts), unique field in join table (3 pts)

> Every time a logged-in user answers incorrectly, the miss is recorded in a join table. The profile page surfaces the words they keep getting wrong.

### Story 11
`[BASELINE — many-to-many with join table part of 8 pts]`
`[CUSTOM — data auto-generated on event: 3 pts]`

As a **registered user**, I want a missed-word record to be automatically created in the database when I answer a question incorrectly so that I do not have to manually log my mistakes.

### Story 12
`[CUSTOM — unique field in join table: 3 pts]`

As a **registered user**, I want each word I miss to have a running miss count stored as a unique field in the join table so that the app can rank words by how often I get them wrong.

### Story 13
`[BASELINE — contributes to: RESTful API GET part of 15 pts]`

As a **registered user**, I want to view a "Words You Keep Missing" list on my profile page, sorted from most missed to least missed, so that I can focus my practice on my weakest words.

---

# FEATURE 5 — Custom Deck Creator (CRUD)
**Owner: Robert Cunningham**
**Rubric contributions:** Baseline — one-to-many DB relationship (part of 8 pts), full RESTful API GET/POST/PATCH/DELETE (15 pts), hierarchical React components (6 pts); Custom Required — POST/PATCH validated before DB update (3 pts)

> Registered users can create, view, update, and delete custom word decks and the words inside them.

### Story 14
`[BASELINE — RESTful API POST part of 15 pts, one-to-many relationship part of 8 pts]`

As a **registered user**, I want to create a new custom word deck by entering a title and clicking Save so that I can group words I want to study together.

### Story 15
`[BASELINE — RESTful API GET part of 15 pts, hierarchical React components part of 6 pts]`

As a **registered user**, I want to view all of my custom decks in a dashboard with one card per deck so that I can quickly see and navigate to any of my decks.

### Story 16
`[BASELINE — RESTful API PATCH part of 15 pts]`

As a **registered user**, I want to edit the title of an existing deck or update a word's definition inside a deck so that I can correct mistakes without deleting and recreating the deck.

### Story 17
`[BASELINE — RESTful API DELETE part of 15 pts]`

As a **registered user**, I want to delete a deck or remove an individual word from a deck so that I can keep my decks clean and relevant.

### Story 18
`[CUSTOM — POST/PATCH validated before DB update: 3 pts]`

As a **registered user**, I want the app to block me from saving a deck with a blank title or saving a word with an empty definition, showing an inline error message, so that my decks never contain incomplete entries.

---

# FEATURE 6 — Split Direction Leaderboards
**Owner: Parth Patel**
**Rubric contributions:** Baseline — reset database to default state (4 pts); Custom Required — filtering/sorting (3 pts)

> A leaderboard ranked by score, split into two tabs by game direction. Players can toggle between "Chinese → Japanese" and "Japanese → Chinese" rankings.

### Story 19
`[BASELINE — contributes to: RESTful API GET part of 15 pts, dynamic frontend routes part of 4 pts]`

As a **player**, I want to navigate to a leaderboard page after finishing a round so that I can compare my score with other players.

### Story 20
`[CUSTOM — filtering/sorting: 3 pts]`

As a **player**, I want the leaderboard to be split by game direction so that scores from "Chinese → Japanese" players and "Japanese → Chinese" players are ranked separately and I can toggle between them without a page reload.

### Story 21
`[BASELINE — reset database to default state: 4 pts]`

As an **admin**, I want to trigger a database reset endpoint so that all scores, missed-word records, and custom decks are wiped and the default word data is restored for testing.

---

# FEATURE 7 — Error Handling (All Features)
**Owner: All (Parth Patel coordinates)**
**Rubric contributions:** Custom Required — graceful error handling (3 pts)

> Every API route returns a useful error message and HTTP status code. The frontend catches errors and shows user-friendly messages instead of blank screens or crashes.

### Story 22
`[CUSTOM — graceful error handling: 3 pts]`

As a **player**, I want to see a friendly error message if the server fails to load a word or save my score so that I understand something went wrong instead of seeing a blank screen or crash.

### Story 23
`[CUSTOM — graceful error handling: 3 pts]`

As a **registered user**, I want the app to display an inline error when a form submission fails (e.g., network error, duplicate entry) so that I know to try again without losing what I typed.

---

# FEATURE 8 — Authentication / Protected Routes
**Owner: Parth Patel**
**Rubric contributions:** Stretch — login required for subset of pages (3 pts)

> GitHub OAuth or username/password login. Personal Missed Words History, Custom Deck Creator, and the user profile are protected routes that require login.

### Story 24
`[STRETCH — login required for subset of pages: 3 pts]`

As a **visitor**, I want to log in with my GitHub account or a username and password so that I can access my personal saved data across sessions.

### Story 25
`[STRETCH — login required for subset of pages: 3 pts]`

As a **visitor**, I want to be redirected to a login page if I try to access my profile, missed words list, or custom decks without being logged in so that personal data is protected.

---

# FEATURE 9 — Loading States & Button Safeguards
**Owner: Hunter Smith**
**Rubric contributions:** Stretch — show spinner while loading (2 pts), disable buttons during form submission (2 pts)

> Spinner shown while data is fetching. Buttons are disabled during form submission and after being clicked to prevent double-submits.

### Story 26
`[STRETCH — show spinner while loading: 2 pts]`

As a **player**, I want to see a loading spinner while the game screen fetches the next word from the database so that I know the app is working and have not hit an error.

### Story 27
`[STRETCH — disable buttons during form submission: 2 pts]`

As a **registered user**, I want the Save button on a deck form to be disabled and visually grayed out while my submission is being sent to the server so that I cannot accidentally submit the form twice.

---

# FEATURE 10 — Toast Notifications
**Owner: Robert Cunningham**
**Rubric contributions:** Stretch — toast messages on user events (3 pts)

> Brief toast pop-ups confirm successful actions (deck saved, word deleted, score submitted) and surface non-blocking errors.

### Story 28
`[STRETCH — toast messages: 3 pts]`

As a **registered user**, I want a brief toast notification to appear at the bottom of the screen when I successfully save a deck, delete a word, or submit a score so that I get clear confirmation without a full-page alert.

### Story 29
`[STRETCH — toast messages: 3 pts]`

As a **player**, I want a toast notification to appear when an action fails silently (e.g., score failed to save) so that I am informed without the game being interrupted.

---

## Story → Feature → Rubric Quick Reference

| Story | Feature | Owner | Rubric Tag | Points |
|---|---|---|---|---|
| 1 | Timed Game Loop | George Liu | BASELINE – same-page interaction, dynamic routes | 3 + 4 |
| 2 | Timed Game Loop | George Liu | BASELINE – same-page interaction, dynamic routes | 3 + 3 |
| 3 | Timed Game Loop | George Liu | BASELINE – same-page interaction | 3 |
| 4 | Timed Game Loop | George Liu | BASELINE – RESTful API GET | part of 15 |
| 5 | Word Reveal Cards | Hunter Smith | CUSTOM – modal/pane + BASELINE same-page | 3 + 3 |
| 6 | Word Reveal Cards | Hunter Smith | CUSTOM – modal/pane + BASELINE RESTful GET | 3 + part of 15 |
| 7 | Word Reveal Cards | Hunter Smith | BASELINE – same-page interaction | 3 |
| 8 | Similarity Meter | Tasneem Shabana | BASELINE – redirection, dynamic routes | 3 + 4 |
| 9 | Similarity Meter | Tasneem Shabana | BASELINE – RESTful GET, dynamic backend routes | part of 15 + 3 |
| 10 | Similarity Meter | Tasneem Shabana | BASELINE – hierarchical React components | part of 6 |
| 11 | Missed Words | Tasneem Shabana | BASELINE – many-to-many + CUSTOM auto-generated data | part of 8 + 3 |
| 12 | Missed Words | Tasneem Shabana | CUSTOM – unique field in join table | 3 |
| 13 | Missed Words | Tasneem Shabana | BASELINE – RESTful GET | part of 15 |
| 14 | Deck Creator | Robert Cunningham | BASELINE – RESTful POST, one-to-many | part of 15 + part of 8 |
| 15 | Deck Creator | Robert Cunningham | BASELINE – RESTful GET, hierarchical components | part of 15 + part of 6 |
| 16 | Deck Creator | Robert Cunningham | BASELINE – RESTful PATCH | part of 15 |
| 17 | Deck Creator | Robert Cunningham | BASELINE – RESTful DELETE | part of 15 |
| 18 | Deck Creator | Robert Cunningham | CUSTOM – POST/PATCH validated before DB update | 3 |
| 19 | Leaderboards | Parth Patel | BASELINE – RESTful GET, dynamic routes | part of 15 + part of 4 |
| 20 | Leaderboards | Parth Patel | CUSTOM – filtering/sorting | 3 |
| 21 | Leaderboards | Parth Patel | BASELINE – reset database to default state | 4 |
| 22 | Error Handling | All / Parth coordinates | CUSTOM – graceful error handling | 3 |
| 23 | Error Handling | All / Parth coordinates | CUSTOM – graceful error handling | 3 |
| 24 | Auth / Protected Routes | Parth Patel | STRETCH – login required for pages | 3 |
| 25 | Auth / Protected Routes | Parth Patel | STRETCH – login required for pages | 3 |
| 26 | Loading States | Hunter Smith | STRETCH – spinner while loading | 2 |
| 27 | Loading States | Hunter Smith | STRETCH – disable buttons during submission | 2 |
| 28 | Toast Notifications | Robert Cunningham | STRETCH – toast messages | 3 |
| 29 | Toast Notifications | Robert Cunningham | STRETCH – toast messages | 3 |
