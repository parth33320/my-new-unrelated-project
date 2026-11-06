# Session PA Compaction: player_stats 1:1, Non-RESTful Routes, and Dynamic UI Restrictions

## Summary of Accomplishments
1. **Deliverable 1 — player_stats 1:1 Table**:
   - `tandem/server/src/db/schema.sql`: Added `player_stats` table with `player_id INTEGER PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE`.
   - `tandem/server/src/controllers/players.js`: Updated `createPlayer` to auto-insert a row in `player_stats` with `ON CONFLICT DO NOTHING`.
   - `tandem/server/src/controllers/scores.js`: Updated `createScore` to accept `speed_ms` (defaults to 0) and update `total_rounds`, `best_score`, and `avg_speed_ms` in `player_stats`.
   - `tandem/server/src/routes/players.js`: Added route `GET /:id/stats` calling `getPlayerStats`.
   - `tandem/client/src/pages/Profile.jsx`: Fetches `/api/players/:id/stats`, shows 3 stat chips ("Rounds: N", "Best: N pts", "Avg speed: Ns") with Spinner while loading, and "No stats yet" on 404.

2. **Deliverable 2 — Custom Non-RESTful Routes**:
   - `tandem/server/src/controllers/leaderboard.js` and `tandem/server/src/db/reset.sql`: Updated database reset to TRUNCATE `player_stats` alongside other tables.
   - `tandem/server/src/controllers/players.js`: Added `recalculateStats` controller action computing `total_rounds` and `best_score` from `scores` table.
   - `tandem/server/src/routes/players.js`: Added non-RESTful route `POST /:id/recalculate-stats`.
   - `tandem/client/src/pages/Home.jsx`: Added "Reset DB" button (small, grey, bottom of page) that calls `POST /api/reset` with disabled state while in-flight and reload.

3. **Deliverable 3 — Restrict Options Dynamically**:
   - `tandem/client/src/pages/Home.jsx`: Start game buttons disabled and show tooltip "Enter a username first" until username has >= 2 characters.
   - `tandem/client/src/pages/Decks.jsx`: Add Word button dynamically disables with label "(Full — 20/20)" when deck contains 20 words.
   - `tandem/client/src/pages/Leaderboard.jsx`: Direction toggle buttons remain enabled; if 0 scores exist for a direction, hides table and shows "No scores yet for this direction".
   - `tandem/client/src/pages/Profile.jsx`: "Clear History" button dynamically hidden when 0 missed words exist, shown when >= 1.

4. **Testing**:
   - `tandem/server/tests/playerStats.test.js`: All 5 test cases passing (POST /api/players creates stats, GET /api/players/:id/stats returns 0, POST /api/scores increments total_rounds, POST /api/reset truncates player_stats, POST /api/players/:id/recalculate-stats recalculates).

PA complete. Start a new Jules session for PB.
