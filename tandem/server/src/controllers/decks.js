import { pool } from '../db/pool.js';
import { httpError, parseId } from '../utils/validation.js';

function validateDeckTitle(title) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw httpError(400, 'Deck title cannot be blank.');
  }
  return title.trim();
}

export async function getDecks(req, res, next) {
  try {
    const rawPlayerId = req.query.player_id;
    if (!rawPlayerId) {
      throw httpError(400, 'player_id query parameter is required.');
    }
    const playerId = parseId(rawPlayerId);

    const query = `
      SELECT
        d.id,
        d.player_id,
        d.deck_title,
        d.created_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', w.id,
              'jp_form', w.jp_form,
              'zh_simplified', w.zh_simplified,
              'meaning_ja', w.meaning_ja,
              'meaning_zh', w.meaning_zh
            )
          ) FILTER (WHERE w.id IS NOT NULL), '[]'
        ) AS words
      FROM decks d
      LEFT JOIN deck_words dw ON d.id = dw.deck_id
      LEFT JOIN words w ON dw.word_id = w.id
      WHERE d.player_id = $1
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `;

    const result = await pool.query(query, [playerId]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

export async function createDeck(req, res, next) {
  try {
    const { player_id: rawPlayerId, deck_title, title } = req.body || {};
    const playerId = parseId(rawPlayerId);
    const validTitle = validateDeckTitle(deck_title ?? title);

    const result = await pool.query(
      'INSERT INTO decks (player_id, deck_title) VALUES ($1, $2) RETURNING id, player_id, deck_title, created_at',
      [playerId, validTitle]
    );

    res.status(201).json({
      ...result.rows[0],
      words: [],
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDeck(req, res, next) {
  try {
    const deckId = parseId(req.params.id);
    const { deck_title, title } = req.body || {};
    const validTitle = validateDeckTitle(deck_title ?? title);

    const updateResult = await pool.query(
      'UPDATE decks SET deck_title = $1 WHERE id = $2 RETURNING id, player_id, deck_title, created_at',
      [validTitle, deckId]
    );

    if (updateResult.rows.length === 0) {
      throw httpError(404, 'Deck not found.');
    }

    const deck = updateResult.rows[0];

    const wordsResult = await pool.query(
      `SELECT w.id, w.jp_form, w.zh_simplified, w.meaning_ja, w.meaning_zh
       FROM deck_words dw
       JOIN words w ON dw.word_id = w.id
       WHERE dw.deck_id = $1`,
      [deckId]
    );

    res.json({
      ...deck,
      words: wordsResult.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDeck(req, res, next) {
  try {
    const deckId = parseId(req.params.id);
    const result = await pool.query('DELETE FROM decks WHERE id = $1 RETURNING id', [deckId]);

    if (result.rows.length === 0) {
      throw httpError(404, 'Deck not found.');
    }

    res.json({ message: 'Deck deleted.' });
  } catch (error) {
    next(error);
  }
}

export async function addWordToDeck(req, res, next) {
  try {
    const deckId = parseId(req.params.id);
    const rawWordId = req.body?.word_id ?? req.body?.wordId;
    const wordId = parseId(rawWordId);

    const deckCheck = await pool.query('SELECT id FROM decks WHERE id = $1', [deckId]);
    if (deckCheck.rows.length === 0) {
      throw httpError(404, 'Deck not found.');
    }

    const wordCheck = await pool.query('SELECT id FROM words WHERE id = $1', [wordId]);
    if (wordCheck.rows.length === 0) {
      throw httpError(404, 'Word not found.');
    }

    await pool.query(
      'INSERT INTO deck_words (deck_id, word_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [deckId, wordId]
    );

    res.status(201).json({ message: 'Word added to deck.' });
  } catch (error) {
    next(error);
  }
}

export async function removeWordFromDeck(req, res, next) {
  try {
    const deckId = parseId(req.params.id);
    const wordId = parseId(req.params.wordId);

    const deckCheck = await pool.query('SELECT id FROM decks WHERE id = $1', [deckId]);
    if (deckCheck.rows.length === 0) {
      throw httpError(404, 'Deck not found.');
    }

    await pool.query('DELETE FROM deck_words WHERE deck_id = $1 AND word_id = $2', [deckId, wordId]);

    res.json({ message: 'Word removed from deck.' });
  } catch (error) {
    next(error);
  }
}
