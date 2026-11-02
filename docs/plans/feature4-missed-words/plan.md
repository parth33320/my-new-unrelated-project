# Feature 4 — Personal Missed Words History (Stories 11–13) Plan

## Overview
Feature 4 tracks words that a registered user answers incorrectly or times out on during quiz rounds, persists those misses in the many-to-many `user_missed_words` join table, maintains a running `total_miss_count` per word per player, and surfaces them sorted descending by miss count on the user profile (`/profile`).

## Architecture & Program Design: 6-Tier Execution Call Stack Trace

```text
Execution Call Stack Trace:
└── [Project] Tandem Fullstack Application (tandem/client & tandem/server)
    ├── [Configuration/Env] PORT=3001, BASE_URL=https://my-new-unrelated-project.onrender.com
    └── [Folder] tandem/server/src
        ├── [File] routes/scores.js
        │   └── [Class] Router (Express Router Instance)
        │       └── [Method] router.post('/', createScore)
        ├── [File] controllers/scores.js
        │   └── [Class] ScoresController
        │       └── [Method] createScore(req: Request, res: Response, next: NextFunction)
        │           ├── [Variable State Shift] Inbound: req.body = { playerId: 17, score: 50, direction: "zh-ja", word_ids: [1, 2] }
        │           ├── [Variable State Shift] Resolved: rawPlayerId = req.body?.playerId ?? req.body?.player_id (17)
        │           ├── [Method] parseId(rawPlayerId: 17) -> returns 17
        │           ├── [Method] parseDirection(rawDirection: "zh-ja") -> returns "zh-ja"
        │           ├── [Method] pool.query('INSERT INTO scores ...', [playerId, score, direction])
        │           │   └── [Folder] tandem/server/src/db
        │           │       └── [File] pool.js
        │           │           └── [Class] pg.Pool
        │           │               └── [Method] pool.query(...) -> returns score row
        │           ├── [Variable State Shift] Loop missedIds: [1, 2]
        │           │   ├── [Variable State Shift] wordId = 1 -> parsedWordId = 1
        │           │   ├── [Method] pool.query('INSERT INTO user_missed_words ... ON CONFLICT DO UPDATE ...', [17, 1])
        │           │   │   └── [Variable State Shift] Mutated Result: user_missed_words (player_id=17, word_id=1, total_miss_count=1)
        │           │   ├── [Variable State Shift] wordId = 2 -> parsedWordId = 2
        │           │   └── [Method] pool.query('INSERT INTO user_missed_words ... ON CONFLICT DO UPDATE ...', [17, 2])
        │           │       └── [Variable State Shift] Mutated Result: user_missed_words (player_id=17, word_id=2, total_miss_count=1)
        │           └── [Method] res.status(201).json(scoreResult.rows[0])
        ├── [File] routes/players.js
        │   └── [Class] Router (Express Router Instance)
        │       └── [Method] router.get('/:id', getPlayer)
        ├── [File] controllers/players.js
        │   └── [Class] PlayersController
        │       └── [Method] getPlayer(req: Request, res: Response, next: NextFunction)
        │           ├── [Variable State Shift] Inbound: req.params.id = "17"
        │           ├── [Method] parseId("17") -> returns 17
        │           ├── [Method] pool.query('SELECT ... FROM players WHERE id = $1', [17])
        │           ├── [Method] pool.query('SELECT ... FROM scores WHERE player_id = $1 ...', [17])
        │           ├── [Method] pool.query('SELECT umw.word_id, umw.total_miss_count, ... FROM user_missed_words umw ... ORDER BY umw.total_miss_count DESC', [17])
        │           │   └── [Variable State Shift] Mutated Result: missed_words = [{ word_id: 2, total_miss_count: 2, ... }, { word_id: 1, total_miss_count: 1, ... }]
        │           └── [Method] res.json({ id: 17, username: "...", scores: [...], missed_words: [...] })
        └── [Folder] tandem/client/src
            ├── [File] pages/Profile.jsx
            │   └── [Class] Profile (React Functional Component Instance)
            │       ├── [Method] fetchProfile(playerId: 17)
            │       │   ├── [Variable State Shift] Inbound: playerId = 17
            │       │   ├── [Method] api('/players/17') -> returns { id: 17, missed_words: [...] }
            │       │   └── [Variable State Shift] Mutated Result: profileData.missed_words = [{ word_id: 2, total_miss_count: 2 }, ...]
            │       └── [Method] JSX Element Rendering: <ul className="missed-words-list">...</ul>
            │           └── [Variable State Shift] Display: list of missed words with total_miss_count and meanings
```
