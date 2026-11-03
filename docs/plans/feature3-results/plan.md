# Feature 3 — Final Similarity Meter + Avg Answer Speed Plan (Stories 8–10)

## Architecture Overview

Feature 3 finishes a round of 10 questions and presents the final round summary to the user at `/results`. It calculates:
1. **Final Score** and **Correct Answers** count.
2. **True Friend Similarity Meter**: The percentage of words in the round that were True Friends (`trueCount / questions.length * 100`, rounded).
3. **Average Answer Speed**: The average response time across all 10 questions (`calculateAverageSpeed(elapsedTimes)` in seconds rounded to 1 decimal place).

## Program Design: 6-Tier Execution Call Stack Trace

```text
Execution Call Stack Trace:
└── [Project] Tandem Fullstack Application (tandem/client & tandem/server)
    ├── [Configuration/Env] PORT=3001, BASE_URL=https://my-new-unrelated-project.onrender.com, DATABASE_URL=Render PostgreSQL
    └── [Folder] tandem/client/src
        ├── [File] pages/GamePage.jsx
        │   └── [Class] GamePage (React Functional Component Instance)
        │       ├── [Method] handleAnswerClick(choice: string, choiceIndex: number)
        │       │   ├── [Variable State Shift] Inbound: secondsLeft = 6, elapsedTimes = [3.2, 4.1]
        │       │   ├── [Variable State Shift] Mutated Result: elapsed = 10 - 6 = 4.0; elapsedTimes = [3.2, 4.1, 4.0]
        │       │   └── [Method] stop() (from useTimer hook)
        │       ├── [Method] handleTimerExpire()
        │       │   ├── [Variable State Shift] Inbound: secondsLeft = 0, elapsedTimes = [3.2, 4.1, 4.0]
        │       │   └── [Variable State Shift] Mutated Result: elapsed = 10; elapsedTimes = [3.2, 4.1, 4.0, 10.0]
        │       └── [Method] handleNextQuestion()
        │           ├── [Variable State Shift] Inbound: currentIndex = 9, questions.length = 10, elapsedTimes = [2.0, 3.0, ...]
        │           ├── [Method] calculateAverageSpeed(elapsedTimes: number[])
        │           │   ├── [Folder] tandem/client/src/utils
        │           │   └── [File] utils/speed.js
        │           │       └── [Class] SpeedModule
        │           │           └── [Method] calculateAverageSpeed(elapsedTimes: number[])
        │           │               ├── [Variable State Shift] Inbound: elapsedTimes = [2.0, 4.0]
        │           │               └── [Variable State Shift] Mutated Result: avgSpeedSeconds = 3.0
        │           └── [Method] navigate('/results', { state: { score, correctCount, avgSpeedSeconds, questions, ... } })
        └── [File] pages/Results.jsx
            └── [Class] Results (React Functional Component Instance)
                └── [Method] Results(props)
                    ├── [Variable State Shift] Inbound: location.state = { score: 80, correctCount: 8, avgSpeedSeconds: 3.5, questions: [{relation: 'true'}, ...] }
                    ├── [Method] calculateSimilarityPercent(trueCount: number, totalQuestions: number)
                    │   ├── [Folder] tandem/client/src/utils
                    │   └── [File] utils/speed.js
                    │       └── [Class] SpeedModule
                    │           └── [Method] calculateSimilarityPercent(trueCount: 4, totalQuestions: 10)
                    │               ├── [Variable State Shift] Inbound: trueCount = 4, totalQuestions = 10
                    │               └── [Variable State Shift] Mutated Result: similarityPercent = 40
                    ├── [Variable State Shift] Mutated Result: avgSpeedDisplay = "3.5s"
                    └── [Method] JSX Element Rendering:
                        ├── <div className="results-container">
                        ├── <div className="stat-item"><span className="stat-label">Final Score</span><span className="stat-value highlight">80 pts</span></div>
                        ├── <div className="stat-item"><span className="stat-label">True Friend Similarity</span><span className="stat-value">40%</span></div>
                        └── <div className="stat-item"><span className="stat-label">Avg Answer Speed</span><span className="stat-value">3.5s</span></div>
```
