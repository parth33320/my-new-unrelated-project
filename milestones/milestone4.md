# Milestone 4

This document should be completed and submitted during **Unit 8** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [x] Update the completion percentage of each GitHub Milestone. The milestone for this unit (Milestone 4 - Unit 8) should be 100% completed when you submit for full points.
- [x] In `readme.md`, check off the features you have completed in this unit by adding a ✅ emoji in front of the feature's name.
  - [x] Under each feature you have completed, include a GIF showing feature functionality.
- [x] In this document, complete all five questions in the **Reflection** section below.

## Reflection

### 1. What went well during this unit?

Our team made major progress in translating planned architecture into functional, tested full-stack features. We successfully completed full CRUD capabilities for custom word decks with client and server validations, established directional split leaderboards with query filtering, and integrated dynamic reveal modal cards. In addition, implementing automated unit tests across our Express API endpoints and client components ensured that features functioned cohesively without regressions.

### 2. What were some challenges your group faced in this unit?

A primary challenge was synchronizing client-side game state with backend persistence when tracking missed words in the `user_missed_words` join table. Specifically, handling edge cases where players navigate away mid-round or play unauthenticated required us to design clear fallback behaviors and session tracking. Another challenge was standardizing error handling across asynchronous controller actions to ensure consistent HTTP status codes and user-friendly error toast alerts.

### Did you finish all of your tasks in your sprint plan for this week? If you did not finish all of the planned tasks, how would you prioritize the remaining tasks on your list?

Yes, our team finished 100% of the planned tasks scheduled for Unit 8. All planned baseline features (such as deck CRUD operations, REST API endpoints, same-page interactions, and routing) along with custom and stretch features (such as graceful error handling, protected routes, and loading safeguards) were completed, reviewed, and backed by automated tests. Had any task remained unfinished, our prioritization hierarchy would place baseline REST persistence and database join integrity first, followed by custom UX interactions and stretch polish.

### Which features and user stories would you consider “at risk”? How will you change your plan if those items remain “at risk”?

Currently, the core quiz engine and database features are stable and no user stories are at risk of non-delivery. However, external platform dependencies—such as Render free-tier instance cold starts and third-party Cloudinary image upload latency—are areas requiring operational vigilance. To mitigate these risks, our plan incorporates client loading spinners, disabled button states during active network requests, and optimistic timeout safeguards to keep user interactions responsive even under high network latency.

### 5. What additional support will you need in upcoming units as you continue to work on your final project?

In upcoming units (Milestone 5 / Unit 9), we would appreciate guidance on optimizing production build assets and asset bundling on Render to minimize initial page load times. Additionally, receiving feedback on our end-to-end demo walkthrough video and final presentation rubric alignment will ensure all grading requirements and rubrics are thoroughly satisfied.
