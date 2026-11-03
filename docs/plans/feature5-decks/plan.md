# Feature 5 — Custom Deck Creator CRUD (Stories 14–18) Plan

## Program Design: 6-Tier Execution Call Stack Trace

```text
Execution Call Stack Trace:
└── [Project] Tandem Fullstack Application (tandem/client & tandem/server)
    ├── [Configuration/Env] PORT=3001, DATABASE_URL=postgresql://...onrender.com (Render Cloud DB)
    └── [Folder] tandem/server/src
        ├── [File] routes/decks.js
        │   └── [Class] Router (Express Router Instance)
        │       ├── [Method] router.post('/', createDeck)
        │       ├── [Method] router.get('/', getDecks)
        │       ├── [Method] router.patch('/:id', updateDeck)
        │       ├── [Method] router.delete('/:id', deleteDeck)
        │       ├── [Method] router.post('/:id/words', addWordToDeck)
        │       └── [Method] router.delete('/:id/words/:wordId', removeWordFromDeck)
        ├── [File] controllers/decks.js
        │   └── [Class] DecksController
        │       ├── [Method] createDeck(req, res, next)
        │       │   ├── [Variable State Shift] Inbound Param: req.body = { player_id: 12, title: "Test Deck" }
        │       │   ├── [Variable State Shift] Validated Title: validTitle = "Test Deck", parsedId = 12
        │       │   ├── [Method] pool.query('INSERT INTO decks (player_id, deck_title) VALUES ($1, $2) RETURNING id, player_id, deck_title, created_at')
        │       │   └── [Variable State Shift] Response Payload: status(201).json({ id: 1, title: "Test Deck", deck_title: "Test Deck", player_id: 12, words: [] })
        │       ├── [Method] getDecks(req, res, next)
        │       │   ├── [Variable State Shift] Inbound Param: req.query = { playerId: "12" } || { player_id: "12" }
        │       │   ├── [Method] pool.query('SELECT d.id, d.player_id, d.deck_title ... WHERE d.player_id = $1')
        │       │   └── [Variable State Shift] Response Payload: status(200).json([ { id: 1, title: "Test Deck", player_id: 12, words: [] } ])
        │       ├── [Method] updateDeck(req, res, next)
        │       │   ├── [Variable State Shift] Inbound Param: req.params.id = "1", req.body = { title: "Renamed Deck" }
        │       │   ├── [Method] pool.query('UPDATE decks SET deck_title = $1 WHERE id = $2 RETURNING ...')
        │       │   └── [Variable State Shift] Response Payload: status(200).json({ id: 1, title: "Renamed Deck", deck_title: "Renamed Deck", player_id: 12, words: [] })
        │       └── [Method] deleteDeck(req, res, next)
        │           ├── [Variable State Shift] Inbound Param: req.params.id = "1"
        │           ├── [Method] pool.query('DELETE FROM decks WHERE id = $1 RETURNING id')
        │           └── [Variable State Shift] Response Payload: status(204).end()
    └── [Folder] tandem/client/src
        ├── [File] pages/Decks.jsx
        │   └── [Class] Decks (React Functional Component Instance)
        │       ├── [Method] handleCreateDeck(e)
        │       │   ├── [Variable State Shift] Inbound: newDeckTitle = "Test Deck"
        │       │   ├── [Method] api('/decks', { method: 'POST', body: JSON.stringify({ player_id, deck_title }) })
        │       │   ├── [Variable State Shift] Mutated State: decks = [created, ...prev], toastMessage = 'Deck "Test Deck" saved successfully!'
        │       │   └── [Method] DOM Render: <div className="deck-card">...</div> and <div className="toast-notification">...</div>
        │       ├── [Method] handleUpdateTitle(e, deckId)
        │       │   ├── [Variable State Shift] Inbound: editingTitle = "Renamed Deck"
        │       │   ├── [Method] api('/decks/' + deckId, { method: 'PATCH', body: JSON.stringify({ deck_title }) })
        │       │   ├── [Variable State Shift] Mutated State: decks updated, toastMessage = 'Deck renamed to "Renamed Deck"!'
        │       │   └── [Method] DOM Render: title refreshed and toast visible
        │       └── [Method] handleDeleteDeck(deckId)
        │           ├── [Method] api('/decks/' + deckId, { method: 'DELETE' })
        │           ├── [Variable State Shift] Mutated State: decks filtered, toastMessage = 'Deck deleted successfully!'
        │           └── [Method] DOM Render: deck card removed and toast visible
```

## Ubiquitous Language (Feature 5)

- **Deck**: A named collection of vocabulary words created and owned by a specific Player (`decks` table).
- **Deck Title**: The human-readable string identifier for a Deck, validated as non-empty (`deck_title`).
- **Deck Word**: A many-to-many relationship linking a vocabulary word to a deck (`deck_words` join table).
- **Player**: The authenticated learner profile (`players` table) associated with custom decks.

## Stories & Vertical Slices

- **Slice 1 (Tracer Bullet)**: POST `/api/decks` & GET `/api/decks` with Live Render DB persistence and validation.
- **Slice 2 (Story 16 & 17)**: PATCH `/api/decks/:id` & DELETE `/api/decks/:id` (204 status).
- **Slice 3 (Story 14 & 18)**: Word association endpoints (`POST /api/decks/:id/words`, `DELETE /api/decks/:id/words/:wordId`).
- **Slice 4 (Security & Hardening)**: Stored XSS defense validation, 404 handling, and unauthenticated ProtectedRoute UI redirection.
- **Slice 5 (E2E Integration & Recording)**: Full browser automation via Playwright validating deck CRUD with toast feedback and video capture.
