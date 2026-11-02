# Feature 7–10 Test Suite Plan: Error Handling, Auth, Loading States, Toast Notifications & Security

## 1. Overview & Architectural Design
This plan establishes comprehensive Red-Green-Refactor tests for Features 7–10 (Stories 22–29) and cross-feature security requirements for the Tandem application.

### Call Stack Architecture (6-Tier)
```text
Execution Call Stack Trace:
└── [Project] Tandem Fullstack Application (parth33320/my-new-unrelated-project)
    ├── [Configuration/Env] PORT=3001, BASE_URL=https://my-new-unrelated-project.onrender.com (Live Render DB)
    └── [Folder] tandem/client & tandem/server
        ├── [File] tandem/server/src/app.js & tandem/server/src/controllers/*.js
        │   └── [Class] Express Router & Middleware Stack
        │       ├── [Method] Error Handler Middleware: (error, req, res, next)
        │       │   ├── [Variable State Shift] Inbound: error.status = 400 | 404, error.message
        │       │   ├── [Variable State Shift] Mutated Result: res.status(status).json({ error: message })
        │       │   └── [Method] Header Inspection: disable('x-powered-by')
        │       └── [Method] Validation Utilities: parseId, parseUsername, parseDirection
        └── [File] tandem/client/src/pages/*.jsx & components/*.jsx
            ├── [Class] Leaderboard Component
            │   └── [Method] Leaderboard()
            │       ├── [Variable State Shift] Inbound State: loading = true
            │       ├── [Variable State Shift] DOM: .spinner is visible
            │       └── [Variable State Shift] On fetch resolve: loading = false, .spinner is removed
            ├── [Class] Decks Component
            │   ├── [Method] handleCreateDeck(e)
            │   │   ├── [Variable State Shift] State: creating = true -> button[disabled] = true
            │   │   └── [Variable State Shift] On resolve: showToast('...saved...') -> .toast-notification visible
            │   └── [Method] handleRemoveWord(deckId, wordId)
            │       └── [Variable State Shift] On resolve: showToast('Word removed from deck.') -> .toast-notification visible
            ├── [Class] ProtectedRoute Component
            │   └── [Method] ProtectedRoute({ children })
            │       ├── [Variable State Shift] Inbound: player = null
            │       └── [Method] Navigate to '/' with replace
            └── [Class] GamePage Component
                └── [Method] handleNextQuestion()
                    ├── [Variable State Shift] On score save success: showToast('Score saved!')
                    └── [Variable State Shift] On score save error: showToast('Score failed to save.')
```

## 2. Test Plan Scope
1. **Feature 7 — Error Handling**:
   - Backend routes: all major routes (`/api/players`, `/api/scores`, `/api/decks`, `/api/words/round`, `/api/leaderboard`) return JSON `{ error: string }` on invalid inputs/failures, never HTML error pages.
   - Frontend error display: simulate unreachable server / bad base URL on `/leaderboard`, assert `.error-text` element appears.

2. **Feature 8 — Auth/Protected Routes**:
   - Direct navigation to `/profile` without `tandem_player` in localStorage redirects to `/`.
   - Direct navigation to `/decks` without `tandem_player` in localStorage redirects to `/`.
   - After logging in (entering username on Home page), `/profile` and `/decks` are accessible.

3. **Feature 9 — Loading States**:
   - On `/leaderboard`, assert `.spinner` is visible before data loads and gone after.
   - On deck save in `/decks`, assert save button has `disabled` attribute while request is in flight.

4. **Feature 10 — Toasts**:
   - Create a deck -> assert `.toast-notification` appears with text containing "saved".
   - Delete a word from a deck -> assert `.toast-notification` appears.
   - Score saved after round -> assert toast appears with "Score saved!".
   - Simulate score save failure (intercept network) -> assert toast appears with failure message ("Score failed to save.").

5. **Security Tests (Cross-Feature)**:
   - All API routes return 404 (not 500) for unknown IDs.
   - All API routes return 400 (not 500) for malformed request bodies.
   - No route exposes stack traces in response body.
   - Response headers include no sensitive server version info (no `x-powered-by`, etc.).

6. **Live Playwright Video**:
   - Record video covering at least one toast, one redirect, one spinner against live system.
