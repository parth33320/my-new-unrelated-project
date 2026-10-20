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

[gif goes here]

### Dynamic Word Reveal Cards

A card component that displays after each answer to show the word spelling, the word reading, the word meaning, and the word relationship tag side by side for both languages.

[gif goes here]

### Final Similarity Meter Dashboard

A screen at the end of a round that calculates and displays the exact percentage of words seen during the round that share the same meaning in both languages.

[gif goes here]

### Personal Missed Words History

A feature that tracks user answers in a database table to show a list of specific words that the user keeps missing.

[gif goes here]

### Custom Deck Creator (CRUD)

A tool that lets logged-in users create new custom word decks, view existing word decks, update word definitions, and delete incorrect words from the database table.

[gif goes here]

### Split Direction Leaderboards

A data table that ranks user high scores separately based on the chosen game direction, showing if Chinese speakers guess Japanese words better than Japanese speakers guess Chinese words.

[gif goes here]

## Installation Instructions

[instructions go here]
