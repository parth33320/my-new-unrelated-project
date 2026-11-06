# Session PD Compaction: Render Live Demo, Screenshots, Checklist & README

## Final Rubric Checklist Audit (102/102 Points)

### BASELINE (59 pts)
- [PASS] Express backend + React frontend — /api/health returns 200 AND React app loads (5 pts)
- [PASS] one-to-many DB (players -> scores, decks -> words) — FK constraint in PostgreSQL schema (part of 8 pts)
- [PASS] many-to-many join table (deck_words, user_missed_words) — composite PKs (part of 8 pts)
- [PASS] RESTful API (GET, POST, PATCH, DELETE on /api/decks) (15 pts)
- [PASS] DB reset — POST /api/reset returns 200 (4 pts)
- [PASS] Redirection — /results page URL distinct from /game (3 pts)
- [PASS] Same-page interaction — question choices and reveal modal overlay (3 pts)
- [PASS] React Router dynamic routes (/game, /results, /decks, /profile, /leaderboard) (4 pts)
- [PASS] Hierarchical components (pages and components directories with containers and presenters) (6 pts)
- [PASS] Dynamic routes frontend + backend (/api/players/:id, /api/decks/:id) (3 pts)
- [PASS] Deployed on Render — Live URL https://my-new-unrelated-project.onrender.com (8 pts)

### CUSTOM (24 pts)
- [PASS] Graceful error handling (3 pts)
- [PASS] One-to-one DB relationship (player_stats table with player_id PK) (3 pts)
- [PASS] Slide-out pane / modal (RevealCard modal overlay) (3 pts)
- [PASS] Unique join table field (deck_words PK, user_missed_words total_miss_count) (3 pts)
- [PASS] Non-RESTful route (/api/reset, /api/players/:id/recalculate-stats) (3 pts)
- [PASS] Filter/sort (leaderboard direction & sort params) (3 pts)
- [PASS] Auto-generated data on event (player_stats auto-created on player insert) (3 pts)
- [PASS] POST/PATCH validation (username length, deck title non-empty, score non-negative) (3 pts)

### STRETCH (19 pts)
- [PASS] Login + protected pages (GitHub OAuth + Passport.js, /decks & /profile protected) (3 pts)
- [PASS] Restrict options dynamically (start buttons disabled without username, full deck 20/20 guard, missed words clear history guard) (3 pts)
- [PASS] Spinner while loading (Spinner audit across Home, Game, Results, Decks, Profile, Leaderboard) (2 pts)
- [PASS] Disable buttons during form submit (100% button audit) (2 pts)
- [PASS] Disable buttons after click (100% button audit exceeding 75% threshold) (2 pts)
- [PASS] Image upload to cloud (Cloudinary SDK + Multer memory storage on /api/players/:id/avatar) (4 pts)
- [PASS] Toast messages (react-hot-toast notifications across all user events) (3 pts)

Total Estimated Score: 102/102

PD complete. Project ready to submit. Estimated score: 102/102.
