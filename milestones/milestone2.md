# Milestone 2

This document tracks execution steps for Unit 6 assignments. All engineering plans, entity architectures, and pitch layouts are ready for deployment.

## Checklist

- [x] In `planning/wireframes.md`: add wireframes for at least three pages in your web app.
  - [x] Include a list of pages in your app
- [x] In `planning/entity_relationship_diagram.md`: add the entity relationship diagram you developed for your database.
  - [x] Your entity relationship diagram should include the tables in your database.
- [x] Prepare your three-minute pitch presentation, to be presented during Unit 7 (the next unit).
  - [x] You do **not** need to submit any materials in advance of your pitch.
- [x] In this document, complete all three questions in the **Reflection** section below

## Reflection

### 1. What went well during this unit?
Our team managed to transition abstract layout mockups into production-ready structural assets efficiently. Choosing Mermaid.js allowed us to coordinate the engineering architecture of our relational schema directly inside our version control logs. This eliminated out-of-sync design artifacts across the group and ensured all data fields align with our feature list.

### 2. What were some challenges your group faced in this unit?
The main challenge was standardizing the entity tracking pattern for historical tracking inside our many-to-many join table (`user_missed_words`). We had to refine the composite indices to support both foreign key linkages while embedding an isolated, unique operational tracking field (`total_miss_count`) that scales automatically during game evaluation events.

### 3. What additional support will you need in upcoming units as you continue to work on your final project?
As we enter Milestone 3 to construct our shared project management boards, we would benefit from feedback regarding best practices for configuring clean, granular code review pipelines. Specifically, we want to maximize parallel component building for our mixed CRUD utilities and loading safeguards while minimizing merge conflicts across branches.
