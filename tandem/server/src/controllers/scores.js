import { pool } from '../db/pool.js';
import { httpError, parseDirection, parseId } from '../utils/validation.js';

export async function createScore(req, res, next) {
  try {
    const { player_id: rawPlayerId, score, direction: rawDirection, word_ids, missed_word_ids } = req.body || {};
    const playerId = parseId(rawPlayerId);
    const direction = parseDirection(rawDirection);

    if (typeof score !== 'number' || isNaN(score) || score < 0) {
      throw httpError(400, 'Score must be a non-negative number.');
    }

    if (score > 10000) return res.status(400).json({ error: 'Invalid score' });

    const rawMissed = word_ids ?? missed_word_ids;
    if (Array.isArray(rawMissed) && rawMissed.length > 20) {
      return res.status(400).json({ error: 'Too many missed word IDs' });
    }

    const missedIds = Array.isArray(word_ids)
      ? word_ids
      : Array.isArray(missed_word_ids)
      ? missed_word_ids
      : [];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const scoreResult = await client.query(
        'INSERT INTO scores (player_id, score, direction) VALUES ($1, $2, $3) RETURNING id, player_id, score, direction, created_at',
        [playerId, score, direction]
      );

      if (missedIds.length > 0) {
        for (const wordId of missedIds) {
          const parsedWordId = parseId(wordId);
          await client.query(
            `INSERT INTO user_missed_words (player_id, word_id, total_miss_count, last_failed_at)
             VALUES ($1, $2, 1, NOW())
             ON CONFLICT (player_id, word_id)
             DO UPDATE SET total_miss_count = user_missed_words.total_miss_count + 1, last_failed_at = NOW()`,
            [playerId, parsedWordId]
          );
        }
      }

      await client.query('COMMIT');
      res.status(201).json(scoreResult.rows[0]);
    } catch (txError) {
      await client.query('ROLLBACK');
      throw txError;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}
