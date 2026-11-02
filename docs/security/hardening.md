# Security Hardening Documentation

This document records the security and resilience hardening measures implemented in the Tandem fullstack application.

---

## 1. Disable POST /api/reset in Production

- **Vulnerability:** Unauthenticated clients could trigger `/api/reset` to drop/truncate all database tables (scores, decks, deck_words, user_missed_words).
- **Remediation:** Added a production environment gate in `tandem/server/src/controllers/leaderboard.js`:
  ```javascript
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Forbidden' });
  ```
- **Verification:** Unit test `POST /api/reset in production env returns 403` verifies HTTP 403 Forbidden is returned when `NODE_ENV === 'production'`.

---

## 2. Guard Player Mutation Routes

- **Vulnerability:** Unauthenticated or unauthorized callers could rename or delete any player account by targeting `PATCH /api/players/:id` or `DELETE /api/players/:id` without verifying identity.
- **Remediation:** Enforced self-ownership verification in `tandem/server/src/controllers/players.js` for both `renamePlayer` and `deletePlayer`:
  ```javascript
  const requesterId = req.body?.player_id ?? req.body?.playerId ?? req.headers['x-player-id'];
  if (requesterId === undefined || requesterId === null || String(requesterId).trim() === '' || Number(requesterId) !== id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  ```
- **Verification:** Unit tests confirm requests with missing or mismatched IDs in body or `x-player-id` header return HTTP 403 Forbidden.

---

## 3. Ownership Checks for Deck Mutations

- **Vulnerability:** Any caller could update, delete, or alter words of custom decks belonging to other players via `PATCH /api/decks/:id`, `DELETE /api/decks/:id`, `POST /api/decks/:id/words`, and `DELETE /api/decks/:id/words/:wordId`.
- **Remediation:** Added helper `verifyDeckOwnership(deckId, req)` in `tandem/server/src/controllers/decks.js` before executing any mutation:
  - Queries `SELECT player_id FROM decks WHERE id = $1`
  - Returns HTTP 404 if the deck does not exist (`Deck not found.`)
  - Compares the deck's `player_id` against `req.body.playerId`, `req.body.player_id`, `req.query.playerId`, `req.query.player_id`, or `req.headers['x-player-id']`
  - Returns HTTP 403 Forbidden if mismatched or missing.
- **Verification:** Regression test verifies nonexistent deck returns 404 and wrong/missing playerId returns 403.

---

## 4. Rate Limiting via express-rate-limit

- **Vulnerability:** API endpoints were vulnerable to brute-force attacks, DoS, and spam account creation or score submissions.
- **Remediation:** Configured `express-rate-limit` middleware in `tandem/server/src/app.js`:
  - `POST /api/players`: 10 requests per IP per 15-minute window (`playersPostLimiter`)
  - `POST /api/scores`: 30 requests per IP per 15-minute window (`scoresPostLimiter`)
  - Global limiter: 100 requests per IP per 15-minute window (`globalLimiter`) across all routes
  - Returns standard HTTP 429 response: `{ error: 'Too many requests, slow down.' }`.
- **Verification:** Regression test confirms the 11th request to `POST /api/players` from the same IP returns HTTP 429 with `{ error: 'Too many requests, slow down.' }`.

---

## 5. Input Validation & Capping for Scores and Missed Word IDs

- **Vulnerability:** Unbounded array inputs and arbitrary score values allowed memory exhaustion, denial of service, or corrupted leaderboard records.
- **Remediation:** Added validation guards in `tandem/server/src/controllers/scores.js`:
  ```javascript
  if (score > 10000) return res.status(400).json({ error: 'Invalid score' });
  const rawMissed = word_ids ?? missed_word_ids;
  if (Array.isArray(rawMissed) && rawMissed.length > 20) {
    return res.status(400).json({ error: 'Too many missed word IDs' });
  }
  ```
- **Verification:** Regression tests verify that `score > 10000` returns 400 (`Invalid score`) and `missedIds.length > 20` returns 400 (`Too many missed word IDs`).

---

## 6. Atomic Transactions for Score Creation and Missed Word Inserts

- **Vulnerability:** Scores could be created and committed even if inserting associated missed words failed, leaving the database in an inconsistent partial state.
- **Remediation:** Acquired a database client connection (`const client = await pool.connect()`) and wrapped operations in an explicit PostgreSQL transaction in `tandem/server/src/controllers/scores.js`:
  - `await client.query('BEGIN')`
  - Insert into `scores`
  - Upsert loop into `user_missed_words`
  - `await client.query('COMMIT')`
  - `catch (txError)`: `await client.query('ROLLBACK')`
  - `finally`: `client.release()`
- **Verification:** Regression test mocks pool connection and simulates failure during score insertion, confirming `ROLLBACK` is executed and the client connection is released.

---

## 7. React Error Boundary

- **Vulnerability:** Uncaught JavaScript runtime errors in React components would cause a blank white screen, degrading user experience.
- **Remediation:** Created `tandem/client/src/components/ErrorBoundary.jsx` (class component with `getDerivedStateFromError` and `componentDidCatch`) rendering a friendly "Something went wrong" message and a "Reload" button (`window.location.reload()`). Wrapped `<App />` with `<ErrorBoundary>` in `tandem/client/src/main.jsx`.
- **Verification:** Verified frontend production bundling using Vite (`npm run build -w client`).

---

## 8. Unhandled Rejection & Uncaught Exception Process Handlers

- **Vulnerability:** Unhandled promise rejections or synchronous uncaught exceptions could leave Node.js in an undefined state with hanging connections and file descriptors.
- **Remediation:** Registered process event listeners in `tandem/server/src/index.js`:
  ```javascript
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
  });
  ```

---

## 9. Production DATABASE_URL Invariant Enforcement

- **Vulnerability:** In production environments, running without a database connection leads to runtime query crashes and partial startup.
- **Remediation:** Added a fail-fast invariant check at the top of `tandem/server/src/index.js` before starting the HTTP server:
  ```javascript
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL is required in production');
    process.exit(1);
  }
  ```
