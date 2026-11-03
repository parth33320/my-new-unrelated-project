# Feature 1 — Timed Game Loop (Stories 1–4) Plan

## Program Design: 6-Tier Execution Call Stack Trace

```text
Execution Call Stack Trace:
└── [Project] Tandem Fullstack Application (tandem/client & tandem/server)
    ├── [Configuration/Env] PORT=3001, DATABASE_URL=postgresql://tandem_db_8y6o_user:...@dpg-dbi13vlg1s2s73dlv4r0-a.ohio-postgres.render.com/tandem_db_8y6o?sslmode=require
    └── [Folder] tandem/client/src
        ├── [File] pages/Home.jsx
        │   └── [Class] Home (React Functional Component Instance)
        │       └── [Method] handleStart(direction: "zh-ja")
        │           ├── [Variable State Shift] Inbound: username = "learner", direction = "zh-ja"
        │           ├── [Method] api('/players', { method: 'POST', body: JSON.stringify({ username: "learner" }) })
        │           └── [Method] navigate('/game', { state: { direction: "zh-ja" } })
        └── [File] pages/GamePage.jsx
            └── [Class] GamePage (React Functional Component Instance)
                ├── [Method] useEffect (Fetch Round on Mount)
                │   ├── [Variable State Shift] Inbound: direction = "zh-ja"
                │   ├── [Method] api('/words/round?direction=zh-ja')
                │   │   └── [Project] Backend API Boundary (HTTP GET /api/words/round?direction=zh-ja)
                │   │       └── [Folder] tandem/server/src
                │   │           ├── [File] routes/words.js
                │   │           │   └── [Method] router.get('/round', getRound)
                │   │           ├── [File] controllers/words.js
                │   │           │   └── [Class] WordsController
                │   │           │       └── [Method] getRound(req, res, next)
                │   │           │           ├── [Variable State Shift] Inbound Param: req.query.direction = "zh-ja"
                │   │           │           ├── [Method] parseDirection(req.query.direction)
                │   │           │           │   ├── [Folder] tandem/server/src/utils
                │   │           │           │   └── [File] utils/validation.js
                │   │           │           │       └── [Method] parseDirection(value: "zh-ja")
                │   │           │           │           └── [Variable State Shift] Mutated Result: direction = "zh-ja" (valid; rejects if missing/invalid)
                │   │           │           ├── [Method] pool.query('SELECT * FROM words')
                │   │           │           │   └── [Folder] tandem/server/src/db
                │   │           │           │       └── [File] db/pool.js
                │   │           │           │           └── [Class] pg.Pool
                │   │           │           │               └── [Method] query(sql: string)
                │   │           │           │                   └── [Project] Remote Boundary (PostgreSQL Render Database)
                │   │           │           │                       └── [Variable State Shift] Outbound Result: result.rows (500 word records)
                │   │           │           ├── [Method] buildRound(result.rows, direction: "zh-ja")
                │   │           │           │   └── [File] utils/buildRound.js
                │   │           │           │       └── [Class] RoundBuilder
                │   │           │           │           └── [Method] buildRound(words: Word[], direction: "zh-ja")
                │   │           │           │               ├── [Variable State Shift] Inbound: words.length = 500, direction = "zh-ja"
                │   │           │           │               ├── [Variable State Shift] Filter & Slice: 5 true, 3 false, 2 partial (with fallback to fill 10)
                │   │           │           │               ├── [Variable State Shift] First Question: ensure relation != 'false'
                │   │           │           │               └── [Variable State Shift] Mutated Result: questions (Array of 10 Question objects)
                │   │           │           └── [Method] res.json({ questions, scoring: SCORING, direction: "zh-ja" })
                │   │           └── [Variable State Shift] HTTP Response: Status 200 JSON payload
                │   ├── [Variable State Shift] Client State: questions = data.questions, currentIndex = 0, loading = false
                │   └── [Method] reset(10) (Initializes timer to 10s and starts countdown)
                ├── [File] hooks/useTimer.js
                │   └── [Class] useTimer Hook Instance
                │       ├── [Method] setInterval Countdown Loop
                │       │   ├── [Variable State Shift] Inbound: secondsLeft = 10, isRunning = true
                │       │   ├── [Variable State Shift] Tick 1: secondsLeft = 9
                │       │   └── [Variable State Shift] Tick 2: secondsLeft = 8
                │       └── [Method] stop()
                │           └── [Variable State Shift] Mutated State: isRunning = false (timer freezes)
                ├── [File] components/Timer.jsx
                │   └── [Class] Timer (React Presentational Component Instance)
                │       └── [Method] JSX Rendering
                │           └── [Variable State Shift] Render: <span className="timer-seconds timer-display">10s</span>
                ├── [File] components/QuestionCard.jsx
                │   └── [Class] QuestionCard (React Presentational Component Instance)
                │       └── [Method] JSX Rendering
                │           ├── [Variable State Shift] Render: <div className="kanji-display">{currentQuestion.display}</div>
                │           └── [Variable State Shift] Render: 4 button elements with className="choice-btn"
                ├── [Method] handleAnswerClick(choice: string, choiceIndex: 0)
                │   ├── [Variable State Shift] Inbound Click: choiceIndex = 0, secondsLeft = 8
                │   ├── [Method] stop() (Stops useTimer)
                │   │   └── [Variable State Shift] Mutated State: isRunning = false
                │   ├── [Variable State Shift] Mutated State: selectedChoiceIndex = 0, showRevealModal = true
                │   └── [File] components/RevealCard.jsx
                │       └── [Class] RevealCard (React Modal Component Instance)
                │           └── [Variable State Shift] Render: <div className="reveal-modal-card">...</div>
                └── [Method] handleTimerExpire()
                    └── [Variable State Shift] Timeout fallback if secondsLeft reaches 0
```
