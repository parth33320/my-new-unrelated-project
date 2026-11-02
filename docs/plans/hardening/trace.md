# Hardening Architecture Plan & Execution Call Stack Trace

## Program Design: 6-Tier Execution Call Stack Trace

```text
Execution Call Stack Trace:
└── [Project] Tandem Fullstack Application (tandem/client & tandem/server)
    ├── [Configuration/Env] NODE_ENV=production, DATABASE_URL=postgresql://..., PORT=3001
    └── [Folder] tandem/server/src
        ├── [File] src/index.js
        │   └── [Class] RuntimeProcessGuard
        │       ├── [Method] checkProductionDatabaseEnv()
        │       │   ├── [Variable State Shift] Inbound: NODE_ENV = 'production', DATABASE_URL = undefined
        │       │   └── [Variable State Shift] Mutated Result: console.error('FATAL: DATABASE_URL is required in production') -> process.exit(1)
        │       └── [Method] registerProcessExceptionHandlers()
        │           ├── [Variable State Shift] Inbound: unhandledRejection / uncaughtException
        │           └── [Variable State Shift] Mutated Result: logs to stderr -> process.exit(1)
        ├── [File] src/app.js
        │   └── [Class] ExpressAppPipeline
        │       ├── [Method] globalLimiter(req, res, next)
        │       │   ├── [Variable State Shift] Inbound: client IP request count = 101 within 15min
        │       │   └── [Variable State Shift] Mutated Result: res.status(429).json({ error: 'Too many requests, slow down.' })
        │       ├── [Method] playersPostLimiter(req, res, next)
        │       │   ├── [Variable State Shift] Inbound: client IP POST /api/players count = 11 within 15min
        │       │   └── [Variable State Shift] Mutated Result: res.status(429).json({ error: 'Too many requests, slow down.' })
        │       └── [Method] scoresPostLimiter(req, res, next)
        │           ├── [Variable State Shift] Inbound: client IP POST /api/scores count = 31 within 15min
        │           └── [Variable State Shift] Mutated Result: res.status(429).json({ error: 'Too many requests, slow down.' })
        ├── [File] src/controllers/leaderboard.js
        │   └── [Class] LeaderboardController
        │       └── [Method] resetLeaderboard(req, res, next)
        │           ├── [Variable State Shift] Inbound: NODE_ENV = 'production'
        │           └── [Variable State Shift] Mutated Result: res.status(403).json({ error: 'Forbidden' })
        ├── [File] src/controllers/players.js
        │   └── [Class] PlayersController
        │       ├── [Method] renamePlayer(req, res, next)
        │       │   ├── [Variable State Shift] Inbound: req.params.id = '1', requesterId = '2'
        │       │   └── [Variable State Shift] Mutated Result: res.status(403).json({ error: 'Forbidden' })
        │       └── [Method] deletePlayer(req, res, next)
        │           ├── [Variable State Shift] Inbound: req.params.id = '1', requesterId = undefined
        │           └── [Variable State Shift] Mutated Result: res.status(403).json({ error: 'Forbidden' })
        ├── [File] src/controllers/decks.js
        │   └── [Class] DecksController
        │       └── [Method] verifyDeckOwnership(deckId: number, req: Request)
        │           ├── [Variable State Shift] Inbound: deckId = 10, req.body.playerId = 2; DB deck.player_id = 1
        │           ├── [Variable State Shift] Mutated Result: throw httpError(403, 'Forbidden')
        │           └── [Method] updateDeck / deleteDeck / addWordToDeck / removeWordFromDeck
        │               └── [Variable State Shift] Mutated Result: 403 Forbidden sent to client
        ├── [File] src/controllers/scores.js
        │   └── [Class] ScoresController
        │       └── [Method] createScore(req, res, next)
        │           ├── [Variable State Shift] Inbound: req.body.score = 99999
        │           ├── [Variable State Shift] Mutated Result: res.status(400).json({ error: 'Invalid score' })
        │           ├── [Variable State Shift] Inbound: req.body.word_ids.length = 21
        │           ├── [Variable State Shift] Mutated Result: res.status(400).json({ error: 'Too many missed word IDs' })
        │           └── [Method] pool.connect() -> client.query('BEGIN')
        │               ├── [Variable State Shift] Inbound: client.query('INSERT INTO scores ...') fails
        │               ├── [Variable State Shift] Mutated Result: catch (txError) -> client.query('ROLLBACK')
        │               └── [Method] client.release() in finally block
        └── [Folder] tandem/client/src
            ├── [File] components/ErrorBoundary.jsx
            │   └── [Class] ErrorBoundary extends React.Component
            │       ├── [Method] getDerivedStateFromError(error: Error)
            │       │   ├── [Variable State Shift] Inbound: uncaught runtime exception in child tree
            │       │   └── [Variable State Shift] Mutated Result: state = { hasError: true, error }
            │       ├── [Method] componentDidCatch(error, errorInfo)
            │       │   └── [Variable State Shift] Mutated Result: console.error('ErrorBoundary caught an error:', error, errorInfo)
            │       └── [Method] render()
            │           └── [Variable State Shift] Mutated Result: renders friendly 'Something went wrong' UI with 'Reload' button
            └── [File] main.jsx
                └── [Class] RootRenderer
                    └── [Method] ReactDOM.createRoot().render()
                        └── [Variable State Shift] Mutated Result: <ErrorBoundary><BrowserRouter><PlayerProvider><App /></PlayerProvider></BrowserRouter></ErrorBoundary>
```
