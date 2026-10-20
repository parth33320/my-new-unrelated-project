# User Stories

## Outline User Roles

1. `Chinese_Speaker`: A user who knows Chinese characters and wants to guess Japanese words.
2. `Japanese_Speaker`: A user who knows Japanese characters and wants to guess Chinese words.
3. `English_Speaker`: A user who knows neither language and acts as a control group player.

## Draft User Stories

1. As a `Chinese_Speaker`, I want to select the "I know Chinese → guess Japanese" game direction, so that I can test my native character knowledge against Japanese words.
   * **Sequential Example:**
     * *Step 1 (Input):* User clicks the main menu button labeled "I know Chinese → guess Japanese".
     * *Step 2 (Output):* The system records the track selection and loads a quiz question showing a Japanese word.
     * *Desc / Explanation:* The user selecting "I know Chinese → guess Japanese" and the system successfully loading a corresponding Japanese word card confirms that clicking the specific direction button changes the app state correctly.
   * **Sequential Counterexample:**
     * *Step 1 (Input):* User clicks the main menu button labeled "I know Chinese → guess Japanese".
     * *Step 2 (Output):* The system ignores the click, remains stuck on the main menu, and fails to load the quiz question.
     * *Desc / Explanation:* The system completely ignoring the click on "I know Chinese → guess Japanese" and leaving the user stuck on the main menu shows a broken track selection workflow.

2. As a `Japanese_Speaker`, I want to select the "I know Japanese → guess Chinese" game direction, so that I can test my native character knowledge against Chinese words.
   * **Sequential Example:**
     * *Step 1 (Input):* User clicks the main menu button labeled "I know Japanese → guess Chinese".
     * *Step 2 (Output):* The system records the track selection and loads a quiz question showing a Chinese word.
     * *Desc / Explanation:* The system successfully registering the choice on the "I know Japanese → guess Chinese" button and loading a Chinese target word shows that a Japanese user can launch their customized gameplay mode.
   * **Sequential Counterexample:**
     * *Step 1 (Input):* User clicks the main menu button labeled "I know Japanese → guess Chinese".
     * *Step 2 (Output):* The system ignores the click, remains stuck on the main menu, and fails to load the quiz question.
     * *Desc / Explanation:* The system failing to change screens after the click and leaving the user trapped on the main menu screen demonstrates a failure that blocks a user from starting their chosen direction track.

3. As a `Chinese_Speaker`, I want to see the multiple-choice options written as English meanings, so that the quiz game remains a challenge and does not give away the answer in Chinese characters.
   * **Sequential Example:**
     * *Step 1 (Output):* The system displays the quiz question word **手紙**.
     * *Step 2 (Output):* The system generates four multiple-choice answer buttons written in English text: "Letter", "Train", "Car", and "Bed".
     * *Desc / Explanation:* The system displaying choices as English words like "Letter" and "Bed" instead of characters, forcing the player to use actual vocabulary intuition, avoids the design trap of direct shape-matching.
   * **Sequential Counterexample:**
     * *Step 1 (Output):* The system displays the quiz question word **手紙**.
     * *Step 2 (Output):* The system generates multiple-choice answer buttons written in Chinese characters: "手紙" and "汽車", making the answer completely obvious to a Chinese reader.
     * *Desc / Explanation:* The system listing choices like the actual characters "手紙", allowing the Chinese reader to instantly match the shapes without knowing any Japanese, makes the quiz question completely trivial.

4. As a `Japanese_Speaker`, I want to answer quiz questions before a 10-second timer runs out, so that I test my fast instincts.
   * **Sequential Example:**
     * *Step 1 (Output):* The system displays a quiz question with a counting timer starting at 10 seconds.
     * *Step 2 (Input):* User clicks an option at second 6, and the system records the choice successfully.
     * *Desc / Explanation:* The user inputting an answer selection at second 6 and the system registering the choice within the active 10-second countdown confirms that fast player reactions are captured by the timer.
   * **Sequential Counterexample:**
     * *Step 1 (Output):* The system displays a quiz question with a counting timer starting at 10 seconds.
     * *Step 2 (Input):* User clicks an option at second 6, but the system timer ignores the input and counts down to 0, triggering an incorrect time-out screen.
     * *Desc / Explanation:* The system ignoring the user's click at second 6, continuing to count down, and firing a false time-out screen at 0 shows a technical failure that incorrectly punishes a fast player.

5. As an `English_Speaker`, I want to play a control group mode, so that I can see if a person who knows neither language can guess the correct answers using visual patterns.
   * **Sequential Example:**
     * *Step 1 (Input):* User clicks the button "English Speaker Control Mode".
     * *Step 2 (Output):* The system sets up a quiz that tracks scores without any character hints, allowing an English baseline score to register on the leaderboards.
     * *Desc / Explanation:* The system setting a pure control state after the click on "English Speaker Control Mode" to safely measure shape pattern matching allows a non-character reader to participate fairly.
   * **Sequential Counterexample:**
     * *Step 1 (Input):* User clicks the button "English Speaker Control Mode".
     * *Step 2 (Output):* The system crashes or redirects to a standard dual-language screen that assumes the user already reads character forms fluently, ruining the control group experiment.
     * *Desc / Explanation:* The system breaking or routing to a standard bilingual interface instead of loading the clean "English Speaker Control Mode" shows an error that completely invalidates the control group experiment.

6. As a `Chinese_Speaker`, I want to see a word reveal card after each answer, so that I can compare the word reading and the word meaning in both languages side by side.
   * **Sequential Example:**
     * *Step 1 (Input):* User clicks an answer choice button for a question.
     * *Step 2 (Output):* The system pauses and opens a reveal card showing the complete spelling, readings, and meanings for both Chinese and Japanese simultaneously.
     * *Desc / Explanation:* The system stopping the loop right after an answer button click and displaying the comparative reveal card component containing readings and meanings allows the user to study vocabulary parameters mid-game.
   * **Sequential Counterexample:**
     * *Step 1 (Input):* User clicks an answer choice button for a question.
     * *Step 2 (Output):* The system immediately jumps straight to the next quiz question without loading any mid-round reveal card component.
     * *Desc / Explanation:* The system immediately forcing the next quiz question onto the screen, skipping the reveal card completely and depriving the user of any learning data, blocks the user from comparing the vocabulary records.

7. As a `Japanese_Speaker`, I want the word reveal card to show a word relationship tag, so that I know if the word is a true friend, a false friend, or a half friend.
   * **Sequential Example:**
     * *Step 1 (Output):* The system opens the word reveal card for the shared word **手紙**.
     * *Step 2 (Output):* The system renders a red color-coded tag element that reads "Relationship: False Friend" based on database metadata.
     * *Desc / Explanation:* The card component reading the database row for "**手紙**" and successfully outputting the red "Relationship: False Friend" tag element confirms that the system correctly classifies words for the learner.
   * **Sequential Counterexample:**
     * *Step 1 (Output):* The system opens the word reveal card for the shared word **手紙**.
     * *Step 2 (Output):* The system leaves the relationship area blank, forcing the user to guess if the word meaning overlaps or changes across languages.
     * *Desc / Explanation:* The card component opening for "**手紙**" but displaying a completely blank metadata space, leaving the user with no relationship category, shows a failure to provide the core linguistic tag.

8. As a quiz player, I want to see a final similarity meter at the end of a round, so that I know the percentage of words that share the same meaning.
   * **Sequential Example:**
     * *Step 1 (Input):* User answers the tenth and final question of a quiz round.
     * *Step 2 (Output):* The system displays a summary dashboard featuring a "Similarity Meter: 30%" graphic based on the compiled question history data.
     * *Desc / Explanation:* The system tallying the 10 completed questions and outputting a graphical gauge reading "Similarity Meter: 30%" proves that the final percentage summary matches the cultural theme of tracking vocabulary overlap.
   * **Sequential Counterexample:**
     * *Step 1 (Input):* User answers the tenth and final question of a quiz round.
     * *Step 2 (Output):* The system displays a summary dashboard but only shows a raw score number, omitting the similarity meter calculation entirely.
     * *Desc / Explanation:* The summary dashboard printing a raw point total but failing to display the "Similarity Meter" graphic demonstrates a design omission that cuts out the main theme payoff.

9. As a logged-in user, I want to see a list of words I keep missing on my profile page, so that I can study my missed words history.
   * **Sequential Example:**
     * *Step 1 (Input):* User clicks on their profile link navigation element.
     * * Step 2 (Output): The system fetches data rows from the user error database table and populates a scrollable list component displaying their missed words history.
* Desc / Explanation: The system successfully executing a GET request to fetch the user's specific history and rendering a list filled with their missed words proves that mistake tracking is automated.
• Sequential Counterexample:
	• Step 1 (Input): User clicks on their profile link navigation element.
	• Step 2 (Output): The system displays a generic user profile page that lacks any history list component, forcing the user to manually track their own mistakes.
* Desc / Explanation: The profile page loading but containing no history list component, leaving the user completely unable to see their personal missed words, highlights a missing feature.
10. As a custom deck creator, I want to create, view, update, and delete my own word decks, so that I can manage custom words in the database table.
	• Sequential Example:
		• Step 1 (Input): User opens a custom deck creator dashboard, types a word definition entry, and hits "Submit".
		• Step 2 (Output): The system sends an API request to the backend server, modifies the rows in the database table, and updates the visible deck list component instantly.
* Desc / Explanation: The custom deck dashboard capturing the input, executing a server-side table insert, and instantly drawing the new card content on the screen confirms that the user can manage persistent data packages via CRUD tools.
	• Sequential Counterexample:
		• Step 1 (Input): User opens a custom deck creator dashboard, types a word definition entry, and hits "Submit".
		• Step 2 (Output): The system updates the text on the interface screen but fails to trigger any backend database table request, resulting in changes vanishing upon restarting the app.
* Desc / Explanation: The interface accepting the text typing but failing to trigger a backend database request, causing all custom deck data to vanish upon a page reload, reveals a broken database pipeline.

