CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  username VARCHAR(24) UNIQUE NOT NULL CHECK (length(trim(username)) BETWEEN 2 AND 24),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Usernames are unique regardless of capitalization.
CREATE UNIQUE INDEX IF NOT EXISTS players_username_lower ON players (lower(username));

CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  score NUMERIC(8, 2) NOT NULL CHECK (score >= 0),
  direction TEXT NOT NULL CHECK (direction IN ('zh-ja', 'ja-zh')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS scores_player_recent ON scores (player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS scores_direction_best ON scores (direction, player_id, score DESC);

CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  jp_form TEXT NOT NULL,
  zh_simplified TEXT NOT NULL,
  zh_traditional TEXT NOT NULL,
  jp_reading JSONB NOT NULL,
  pinyin JSONB NOT NULL,
  relation TEXT NOT NULL CHECK (relation IN ('true', 'false', 'partial')),
  reading_type TEXT NOT NULL CHECK (reading_type IN ('on', 'kun', 'mixed')),
  meaning_ja TEXT NOT NULL,
  meaning_zh TEXT NOT NULL,
  distractors JSONB NOT NULL,
  category_ja TEXT NOT NULL,
  category_zh TEXT NOT NULL,
  sentence_ja TEXT NOT NULL,
  sentence_ja_en TEXT NOT NULL,
  sentence_zh TEXT NOT NULL,
  sentence_zh_en TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  note TEXT
);

CREATE TABLE IF NOT EXISTS decks (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  deck_title TEXT NOT NULL CHECK (length(trim(deck_title)) >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deck_words (
  deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  PRIMARY KEY (deck_id, word_id)
);

CREATE TABLE IF NOT EXISTS user_missed_words (
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  total_miss_count INTEGER NOT NULL DEFAULT 1,
  last_failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (player_id, word_id)
);
