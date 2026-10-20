# Tandem

CodePath WEB103 Final Project

Designed and developed by: [Insert Member 1 Name], [Insert Member 2 Name], [Insert Member 3 Name]

🔗 Link to deployed app:

## About

### Description and Purpose

Tandem is a timed web-based quiz game about how much Chinese and Japanese words overlap. Both languages use Chinese characters, so a speaker of one language can often guess the meaning of words in the other language. However, some words look identical but mean completely different things. The purpose of Tandem is to test language learners on words categorized into three relationships: true friends (same characters, same meaning), false friends (same characters, different meaning), and half friends (related but shifted meaning). The game helps users see how much the two languages match through a final similarity meter.

### Inspiration

Our project is inspired by the funny mistakes language learners make when they guess words across Chinese and Japanese. For example, the word 手紙 means a written letter in Japanese, but it means toilet paper in Chinese. We wanted to build a game that turns these common character traps into a fun quiz game that helps users learn words using real data.

## Tech Stack

Frontend: React, React Router, CSS

Backend: Express, Node.js, PostgreSQL

## Features

### Timed Game Loop Mode

A quiz game mode where players choose a game direction, view a word, and pick the correct English meaning within a strict 8 to 10 second timer.

*   **Sequential Example:**
    *   *Step 1 (Input):* Player clicks the button "I know Chinese → guess Japanese".
    *   *Step 2 (Output):* The system loads the game screen, displays the word **手紙**, and starts a visual 10-second timer counting down.
    *   *Step 3 (Input):* Player clicks the multiple-choice option "Letter" at second 4.
    *   *Step 4 (Output):* The system stops the timer, records the choice, and highlights the answer.
    *   *Explanation:* Stopping the visual 10-second timer at second 4 when the player clicks "Letter" confirms that the system successfully manages the quiz flow by stopping the timer right when the player inputs an answer.
*   **Sequential Counterexample:**
    *   *Step 1 (Input):* Player clicks the button "I know Chinese → guess Japanese".
    *   *Step 2 (Output):* The system loads the game screen, displays the word **手紙**, and starts a visual 10-second timer counting down.
    *   *Step 3 (Input):* Player clicks the multiple-choice option "Letter" at second 4.
    *   *Step 4 (Output):* The system does not stop the timer, does not record the choice, and the timer counts down to 0, causing a false game-over screen.
    *   *Explanation:* The system failing to stop the timer at second 4 and forcing a false game-over screen despite the user clicking "Letter" demonstrates a broken game state where player input is completely ignored.

[gif goes here]

### Dynamic Word Reveal Cards

A card component that displays after each answer to show the word spelling, the word reading, the word meaning, and the word relationship tag side by side for both languages.

*   **Sequential Example:**
    *   *Step 1 (Input):* Player clicks a multiple-choice option for the word **手紙**.
    *   *Step 2 (Output):* The system halts the game loop and opens a modal card component on top of the same page.
    *   *Step 3 (Output):* The card component displays "Japanese: 手紙 (tegami) = Letter" side by side with "Chinese: 手紙 (shǒuzhǐ) = Toilet paper".
    *   *Step 4 (Output):* The card component displays a prominent red "False Friend" relationship tag.
    *   *Explanation:* The component displaying the side-by-side linguistic breakdown for "手紙" and accurately showing the red "False Friend" relationship tag shows that the system successfully isolates the word data on a modal card component.
*   **Sequential Counterexample:**
    *   *Step 1 (Input):* Player clicks a multiple-choice option for the word **手紙**.
    *   *Step 2 (Output):* The system halts the game loop and opens a modal card component on top of the same page.
    *   *Step 3 (Output):* The card component displays "Japanese: 手紙 (tegami) = Letter" side by side with "Chinese: 手紙 (shǒuzhǐ) = Toilet paper".
    *   *Step 4 (Output):* The card component leaves the relationship tag space blank because it failed to fetch the relationship metadata from the database table.
    *   *Explanation:* The component failing to display the relationship tag for "手紙" and leaving the space blank demonstrates a database communication failure where crucial data is missing from the screen.

[gif goes here]

### Final Similarity Meter Dashboard

A screen at the end of a round that calculates and displays the exact percentage of words seen during the round that share the same meaning in both languages.

*   **Sequential Example:**
    *   *Step 1 (Input):* Player clicks the final multiple-choice option of a 10-word quiz round.
    *   *Step 2 (Output):* The system finishes the quiz round and redirects the user to the round dashboard screen.
    *   *Step 3 (Output):* The system counts that 4 out of the 10 words seen were tagged as true friends in the database table.
    *   *Step 4 (Output):* The system renders a progress bar displaying a "40% Similarity Meter" to show how much the languages matched.
    *   *Explanation:* The system counting 4 out of 10 true friends and displaying a "40% Similarity Meter" graphic proves that the application successfully calculates the proportion of identical words from the completed round.
*   **Sequential Counterexample:**
    *   *Step 1 (Input):* Player clicks the final multiple-choice option of a 10-word quiz round.
    *   *Step 2 (Output):* The system finishes the quiz round and redirects the user to the round dashboard screen.
    *   *Step 3 (Output):* The system fails to count how many words seen were tagged as true friends in the database table.
    *   *Step 4 (Output):* The system renders a progress bar displaying an error message or "0% Similarity Meter" instead of the real calculation.
    *   *Explanation:* The system failing to count the true friends and outputting an error or a broken "0% Similarity Meter" illustrates a dashboard calculation failure that deprives the player of their round summaries.

[gif goes here]

### Personal Missed Words History

A feature that tracks user answers in a database table to show a list of specific words that the user keeps missing.

*   **Sequential Example:**
    *   *Step 1 (Input):* Logged-in user clicks an incorrect option for the word **勉強** during a quiz round.
    *   *Step 2 (Output):* The system sends a `POST` request to the database table to update the user's error history count for **勉強**.
    *   *Step 3 (Input):* Logged-in user clicks on their personal profile page after finishing the game.
    *   *Step 4 (Output):* The system sends a `GET` request and displays **勉強** at the top of a "Words You Keep Missing" list component.
    *   *Explanation:* The system updating the error count for "**勉強**" in the database via a `POST` request and successfully displaying it inside the "Words You Keep Missing" list on the profile page confirms that user mistakes are successfully registered and tracked.
*   **Sequential Counterexample:**
    *   *Step 1 (Input):* Logged-in user clicks an incorrect option for the word **勉強** during a quiz round.
    *   *Step 2 (Output):* The system sends a `POST` request to the database table to update the user's error history count for **勉強**.
    *   *Step 3 (Input):* Logged-in user clicks on their personal profile page after finishing the game.
    *   *Step 4 (Output):* The system displays a generic welcome message and an empty list because it failed to pull the personal history from the database table.
    *   *Explanation:* The profile page failing to run the database check and showing an empty list component instead of displaying "**勉強**" highlights a tracking failure where a user's personal mistake history is lost.

[gif goes here]

### Custom Deck Creator (CRUD)

A tool that lets logged-in users create new custom word decks, view existing word decks, update word definitions, and delete incorrect words from the database table.

*   **Sequential Example:**
    *   *Step 1 (Input):* Logged-in user navigates to the deck dashboard and clicks the button "Create New Deck".
    *   *Step 2 (Input):* Logged-in user types "My Difficult Kanji" into the title field component and clicks the button "Save Deck".
    *   *Step 3 (Output):* The system sends a `POST` request to insert a new row into the `decks` database table.
    *   *Step 4 (Output):* The screen automatically redirects back to the dashboard, rendering a new visual card for "My Difficult Kanji".
    *   *Explanation:* The system processing a database `POST` request and outputting a persistent card named "My Difficult Kanji" shows a successful creation workflow that updates the backend database table.
*   **Sequential Counterexample:**
    *   *Step 1 (Input):* Logged-in user navigates to the deck dashboard and clicks the button "Create New Deck".
    *   *Step 2 (Input):* Logged-in user types "My Difficult Kanji" into the title field component and clicks the button "Save Deck".
    *   *Step 3 (Output):* The system updates the text on the screen temporarily but fails to send a `POST` request to the database table.
    *   *Step 4 (Output):* The user refreshes the browser page, causing the new card to disappear completely because the row was never saved in the database table.
    *   *Explanation:* The system failing to send the database request, causing the card "My Difficult Kanji" to completely disappear when the browser is refreshed, points to a lack of persistence where information is not saved.

[gif goes here]

### Split Direction Leaderboards

A data table that ranks user high scores separately based on the chosen game direction, showing if Chinese speakers guess Japanese words better than Japanese speakers guess Chinese words.

*   **Sequential Example:**
    *   *Step 1 (Input):* Player finishes a quiz round in the "I know Chinese → guess Japanese" direction and clicks "View Leaderboards".
    *   *Step 2 (Output):* The system executes a GET request to fetch scores filtered specifically by that direction track.
    *   *Step 3 (Output):* The system loads the leaderboard page and defaults to displaying the "Chinese → Guess Japanese" data table component.
    *   *Step 4 (Input):* Player clicks a toggle switch component labeled "Switch to Japanese → Guess Chinese".
    *   *Step 5 (Output):* The component instantly slides away the old scores and displays a separate ranking table for the reverse direction.
    *   *Explanation:* The toggle switch component successfully swapping the active view from the "Chinese → Guess Japanese" table to the reverse track table proves that the system successfully separates scores and changes lists based on player input.
*   **Sequential Counterexample:**
    *   *Step 1 (Input):* Player finishes a quiz round in the "I know Chinese → guess Japanese" direction and clicks "View Leaderboards".
    *   *Step 2 (Output):* The system executes a GET request to fetch scores filtered specifically by that direction track.
    *   *Step 3 (Output):* The system loads the leaderboard page and defaults to displaying the "Chinese → Guess Japanese" data table component.
    *   *Step 4 (Input):* Player clicks a toggle switch component labeled "Switch to Japanese → Guess Chinese".
    *   *Step 5 (Output):* The component breaks, does nothing, and continues showing the Chinese tracker scores regardless of the user clicking the switch.
    *   *Explanation:* The component freezing and failing to change data when the player clicks "Switch to Japanese → Guess Chinese", leaving the old table frozen on screen, shows a failure in separating or rendering the alternate direction rankings.

[gif goes here]

## Installation Instructions

[instructions go here]
