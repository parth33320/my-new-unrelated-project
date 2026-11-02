# Feature 2 / Stories 5–7 — Word Reveal Modal Plan

## Program Design: 6-Tier Execution Call Stack Trace

```text
Execution Call Stack Trace:
└── [Project] Tandem Fullstack Application (tandem/client & tandem/server)
    ├── [Configuration/Env] PORT=3001, DATABASE_URL=postgresql://tandem_db_8y6o_user:...@dpg-dbi13vlg1s2s73dlv4r0-a.ohio-postgres.render.com/tandem_db_8y6o?sslmode=require
    └── [Folder] tandem/client/src
        ├── [File] pages/GamePage.jsx
        │   └── [Class] GamePage (React Functional Component Instance)
        │       ├── [Method] handleAnswerClick(choice: string, choiceIndex: number)
        │       │   ├── [Variable State Shift] Inbound: selectedChoiceIndex = null, showRevealModal = false
        │       │   ├── [Variable State Shift] Mutated Result: selectedChoiceIndex = choiceIndex, showRevealModal = true, isCorrect = (choiceIndex === currentQuestion.correctIndex)
        │       │   └── [Method] stop() (from useTimer hook)
        │       ├── [Method] JSX Element Rendering: RevealCard Modal
        │       │   └── [Folder] tandem/client/src/components
        │       │       └── [File] components/RevealCard.jsx
        │       │           └── [Class] RevealCard (React Functional Component Instance)
        │       │               └── [Method] RevealCard(props: { question, isCorrect, isTimeout, onNext, isLastQuestion })
        │       │                   ├── [Variable State Shift] Inbound: question.reveal = { jp_form: '手紙', zh_simplified: '手纸', relation: 'false', ... }
        │       │                   ├── [Variable State Shift] Mutated Result: relationBadge = { label: 'False Friend ⚠️', class: 'relation-false' }
        │       │                   ├── [Method] RubyText(text: reveal.jp_form, readings: reveal.jp_reading)
        │       │                   ├── [Method] RubyText(text: reveal.zh_simplified, readings: reveal.pinyin)
        │       │                   └── [Method] DOM Render: <div className="reveal-modal-card">...</div> with .reveal-lang-block.ja, .reveal-lang-block.zh, .relation-tag, .next-btn
        │       └── [Method] handleNextQuestion()
        │           ├── [Variable State Shift] Inbound: showRevealModal = true, currentIndex = 0
        │           ├── [Variable State Shift] Mutated Result: showRevealModal = false, currentIndex = 1 (or navigate to /results if currentIndex + 1 === questions.length)
        │           └── [Method] navigate('/results', { state: { ... } }) (if isLastQuestion is true)
        └── [Folder] tandem/server/src
            └── [File] utils/buildRound.js
                └── [Class] BuildRoundModule
                    └── [Method] buildRound(words: Word[], direction: string)
                        ├── [Variable State Shift] Inbound: words = [ { id, jp_form, zh_simplified, ... } ], direction = 'zh-ja'
                        ├── [Variable State Shift] Mutated Result: questions = [ { wordId, display, choices, correctIndex, relation, reveal: { jp_form, zh_simplified, jp_reading, pinyin, meaning_ja, meaning_zh, relation } } ]
                        └── [Method] return questions
```
