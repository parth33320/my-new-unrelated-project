# Feature 6 — Split Direction Leaderboards + Reset (Stories 19–21) Plan

## Overview
This document specifies the architectural design, program execution call stack trace, and test suite definitions for Feature 6: Split Direction Leaderboards and Database Reset.

---

## Program Design: 6-Tier Execution Call Stack Trace

```text
Execution Call Stack Trace:
└── [Project] Tandem Fullstack Application (tandem/client & tandem/server)
    ├── [Configuration/Env] PORT=3001, DATABASE_URL=postgresql://tandem_db_8y6o_user:...@dpg-dbi13vlg1s2s73dlv4r0-a.ohio-postgres.render.com/tandem_db_8y6o?sslmode=require
    ├── [Folder] tandem/server/src
    │   ├── [File] routes/leaderboard.js
    │   │   └── [Class] Express Router Instance
    │   │       └── [Method] router.get('/', getLeaderboard)
    │   ├── [File] controllers/leaderboard.js
    │   │   └── [Class] LeaderboardController Module
    │   │       ├── [Method] getLeaderboard(req: Request, res: Response, next: NextFunction)
    │   │       │   ├── [Variable State Shift] Inbound Query: req.query.direction = "zh-ja", req.query.sort = "date"
    │   │       │   ├── [Method] parseDirection(rawDirection: string)
    │   │       │   │   └── [Variable State Shift] Mutated Result: direction = "zh-ja" (throws 400 if missing or invalid)
    │   │       │   ├── [Variable State Shift] Evaluated Sort: sort = "date"
    │   │       │   ├── [Method] pool.query(queryText: string, [direction]: string[])
    │   │       │   │   └── [Project] Remote Postgres Database Boundary
    │   │       │   └── [Variable State Shift] Outbound Payload: res.status(200).json({ direction, sort, entries: rows })
    │   │       └── [Method] resetLeaderboard(req: Request, res: Response, next: NextFunction)
    │   │           ├── [Method] pool.query('TRUNCATE scores, decks, deck_words, user_missed_words RESTART IDENTITY CASCADE')
    │   │           │   └── [Project] Remote Postgres Database Boundary
    │   │           └── [Variable State Shift] Outbound Payload: res.status(200).json({ message: "Database reset." })
    └── [Folder] tandem/client/src
        └── [File] pages/Leaderboard.jsx
            └── [Class] Leaderboard (React Functional Component Instance)
                ├── [Method] useEffect() -> fetchLeaderboard()
                │   ├── [Variable State Shift] Inbound State: direction = "zh-ja", sort = "score", loading = true
                │   ├── [Method] api('/leaderboard?direction=zh-ja&sort=score')
                │   │   └── [Project] HTTP Network Boundary -> GET /api/leaderboard
                │   └── [Variable State Shift] Mutated State: entries = [...data.entries], loading = false
                ├── [Method] handleDirectionToggle("ja-zh")
                │   ├── [Variable State Shift] Mutated State: direction = "ja-zh", loading = true
                │   └── [Method] fetchLeaderboard() -> swaps table data to Japanese -> Chinese rankings
                ├── [Method] handleSortToggle("date")
                │   ├── [Variable State Shift] Mutated State: sort = "date", loading = true
                │   └── [Method] fetchLeaderboard() -> sorts table by last_played_at
                └── [Method] handleReset()
                    ├── [Variable State Shift] User Confirmation: window.confirm() = true, resetting = true
                    ├── [Method] api('/reset', { method: 'POST' })
                    │   └── [Project] HTTP Network Boundary -> POST /api/reset
                    └── [Variable State Shift] Mutated State: entries = [], resetting = false
```

---

## Test Specifications

### 1. Integration Tests (`tandem/server/tests/leaderboard.test.js`)
- `GET /api/leaderboard?direction=zh-ja` returns 200 with JSON payload containing `direction: 'zh-ja'` and `entries` array.
- `GET /api/leaderboard?direction=ja-zh` returns 200 with JSON payload containing `direction: 'ja-zh'` and `entries` array.
- `GET /api/leaderboard?direction=zh-ja&sort=date` returns 200 with sorted entries.
- `GET /api/leaderboard` with no direction param returns 400 Bad Request (`Direction query parameter is required.`).
- `POST /api/reset` returns 200; subsequent `GET /api/leaderboard?direction=zh-ja` returns empty array.

### 2. Security Tests (`tandem/server/tests/leaderboard.test.js`)
- `GET /api/leaderboard?direction=zh-ja; DROP TABLE scores;--` returns 400 Bad Request preventing SQL injection.
- `POST /api/reset` requires no auth (admin action allowed, succeeds with 200, returns `{ message: 'Database reset.' }` without exposing sensitive data, stack traces, or credentials).

### 3. End-to-End Tests (`tandem/tests/leaderboard.spec.js`)
- Navigate to `/leaderboard`.
- Assert direction toggle buttons are visible.
- Click direction toggle button (`Japanese → Chinese`), assert table re-renders with new direction data.
- Click sort toggle (`Date`), assert table updates.
- Click Reset button, accept confirmation dialog, assert table empties and displays empty state message.
