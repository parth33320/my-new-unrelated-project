# Feature 2 — Dynamic Word Reveal Cards (Stories 5–7) Architecture & Test Plan

## 1. Overview & Architectural Design
This plan specifies the architecture and test coverage for Feature 2: Dynamic Word Reveal Cards (Stories 5–7).
The reveal card modal displays linguistic comparisons between Japanese and Chinese word pairs, including kanji, readings (furigana/pinyin), meanings, and cognitive relationship tag (`True Friend`, `False Friend`, or `Partial Friend`).

### Mandatory Architectural Traceability: 6-Tier Execution Call Stack Trace
```text
Execution Call Stack Trace:
└── [Project] Tandem Fullstack Application (parth33320/my-new-unrelated-project)
    ├── [Configuration/Env] PORT=3001, DATABASE_URL=postgresql://tandem_db_8y6o_user:...@dpg-dbi13vlg1s2s73dlv4r0-a.ohio-postgres.render.com/tandem_db_8y6o?sslmode=require
    └── [Folder] tandem/server & tandem/client
        ├── [File] tandem/server/src/controllers/words.js
        │   └── [Class] Express Router Controller
        │       └── [Method] getRound(req, res, next)
        │           ├── [Variable State Shift] Inbound Param: req.query.direction = 'zh-ja'
        │           ├── [Method] pool.query('SELECT * FROM words')
        │           │   └── [Variable State Shift] Query Result: words = Array<WordRecord>
        │           ├── [Method] buildRound(words, direction) in tandem/server/src/utils/buildRound.js
        │           │   ├── [Variable State Shift] Inbound: words.length >= 10, direction = 'zh-ja'
        │           │   ├── [Variable State Shift] Categorized: selectedTrue (5), selectedFalse (3), selectedPartial (2)
        │           │   ├── [Variable State Shift] Question Object reveal field: { jp_form, zh_simplified, jp_reading, pinyin, meaning_ja, meaning_zh, relation }
        │           │   └── [Variable State Shift] Output: questions = Array<QuestionObject> (length = 10)
        │           └── [Variable State Shift] Response Payload: res.status(200).json({ questions, direction })
        └── [File] tandem/client/src/pages/GamePage.jsx & components/RevealCard.jsx
            ├── [Class] GamePage Component
            │   ├── [Method] handleAnswerClick(choice, choiceIndex)
            │   │   ├── [Variable State Shift] State: isRunning = false (timer stopped)
            │   │   ├── [Variable State Shift] State: showRevealModal = true
            │   │   └── [Variable State Shift] DOM: .reveal-modal-overlay and .reveal-modal-card mounted
            │   └── [Method] handleNextQuestion()
            │       ├── [Variable State Shift] When currentIndex + 1 < questions.length: currentIndex = currentIndex + 1, showRevealModal = false
            │       └── [Variable State Shift] When currentIndex + 1 === questions.length: navigate('/results', { state: ... })
            └── [Class] RevealCard Component
                └── [Method] RevealCard({ question, isCorrect, isTimeout, onNext, isLastQuestion })
                    ├── [Variable State Shift] Inbound: question.reveal, question.relation
                    ├── [Variable State Shift] DOM: .relation-tag element text is 'True Friend', 'False Friend ⚠️', or 'Partial Friend 🔀'
                    ├── [Variable State Shift] DOM: .reveal-lang-block.ja is visible with Kanji/Ruby & Meaning
                    ├── [Variable State Shift] DOM: .reveal-lang-block.zh is visible with Hanzi/Pinyin & Meaning
                    └── [Variable State Shift] DOM Button: .next-btn labeled 'Next Question →' or 'View Results →'
```

## 2. Test Plan Scope

### Server Unit Tests (`tandem/server/tests/revealCard.test.js`)
- Follow `node:test` runner and assertion library (`node:assert/strict`).
- Use the `pool.query` mock pattern from `features7-10.test.js` so no real DB connection is required.
- Test 1: `buildRound` question objects contain all 7 reveal fields:
  - `jp_form`
  - `zh_simplified`
  - `jp_reading`
  - `pinyin`
  - `meaning_ja`
  - `meaning_zh`
  - `relation`
- Test 2: `reveal.relation` is strictly one of `'true'`, `'false'`, `'partial'`.
- Test 3: `GET /api/words/round?direction=zh-ja` returns 200 and each question's `reveal` object contains all 7 fields.

### E2E Playwright Tests (`tandem/tests/tracer.spec.js`)
- Append `test.describe('Feature 2 — Dynamic Word Reveal Cards (Stories 5–7)', ...)` to `tandem/tests/tracer.spec.js`.
- Preserves all existing tests in `tracer.spec.js`.
- User flow:
  1. Start round from `/` with player username.
  2. Answer question, assert `.reveal-modal-card` appears within 5s.
  3. Verify `.reveal-lang-block.ja` and `.reveal-lang-block.zh` are both visible.
  4. Verify `.relation-tag` text matches `/True Friend|False Friend|Partial Friend/i`.
  5. Click `.next-btn` to advance to next question card (`.question-card`).
  6. On 10th question, click `.next-btn` and verify navigation to `/results`.
