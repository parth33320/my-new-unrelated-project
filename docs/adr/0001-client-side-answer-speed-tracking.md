# 0001: Client-Side Answer Speed Tracking

## Context
Story 10 requires calculating and displaying the user's average answer speed on the Results screen at the end of a round alongside the similarity meter and score.

When deciding where to track elapsed answer time, two architectural approaches were evaluated:
1. **Server-Side Tracking**: Recording timestamps on the backend when questions are requested and when answers are received.
2. **Client-Side Tracking**: Measuring elapsed time per question in the browser using the active question timer hook (`useTimer`), deriving elapsed seconds when an answer button is pressed or the timer expires, and computing the round average client-side.

## Decision
We decided to track elapsed answer time directly on the client in `GamePage.jsx` and compute the average answer speed (`avgSpeedSeconds`) before navigating to `Results.jsx`.

## Rationale & Consequences
- **Zero Network Latency Distortion**: Network latency, TCP roundtrips, and backend queueing variance would artificially inflate answer times if tracked on the server. The timer in `useTimer` runs directly in the client UI and reflects the exact interactive experience of the user.
- **Deep Seam & High Locality**: The timed game loop state machine (`useTimer`, timeouts, answer selections) already lives entirely within `GamePage.jsx`. Tracking elapsed time alongside existing score and question progression preserves state locality without introducing unnecessary stateful sessions or heartbeat endpoints to the Express API.
- **Graceful Fault Tolerance & Security**: `Results.jsx` gracefully falls back if `avgSpeedSeconds` is missing or undefined (such as when navigated to directly), preventing runtime crashes or data leakage.
