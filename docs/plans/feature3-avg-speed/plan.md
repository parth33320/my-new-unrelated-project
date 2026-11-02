# Feature 3 / Story 10 — Average Answer Speed Plan

## Program Design: 6-Tier Execution Call Stack Trace

```text
Execution Call Stack Trace:
└── [Project] Tandem Fullstack Application (tandem/client & tandem/server)
    ├── [Configuration/Env] PORT=3001, DATABASE_URL=postgresql://tandem_db_8y6o_user:...@dpg-dbi13vlg1s2s73dlv4r0-a.ohio-postgres.render.com/tandem_db_8y6o?sslmode=require
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
        │           └── [Method] navigate('/results', { state: { score, correctCount, avgSpeedSeconds, ... } })
        └── [File] pages/Results.jsx
            └── [Class] Results (React Functional Component Instance)
                └── [Method] Results(props)
                    ├── [Variable State Shift] Inbound: location.state = { score: 80, correctCount: 8, avgSpeedSeconds: 3.5 }
                    ├── [Variable State Shift] Mutated Result: avgSpeedDisplay = "3.5s"
                    └── [Method] JSX Element Rendering: <div className="stat-item"><span className="stat-label">Avg Answer Speed</span><span className="stat-value">3.5s</span></div>
```
