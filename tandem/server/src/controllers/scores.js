import { pool } from '../db/pool.js';
import { httpError, parseDirection, parseId } from '../utils/validation.js';

export async function createScore(req, res, next) {
  try {
    const { score, direction: rawDirection, word_ids, missed_word_ids } = req.body || {};
    const rawPlayerId = req.body?.playerId ?? req.body?.player_id;
    const playerId = parseId(rawPlayerId);
    const direction = parseDirection(rawDirection);

    if (typeof score !== 'number' || isNaN(score) || score < 0) {
      throw httpError(400, 'Score must be a non-negative number.');
    }

    const speedMs = typeof req.body?.speed_ms === 'number' && !isNaN(req.body.speed_ms) && req.body.speed_ms >= 0
      ? req.body.speed_ms
      : 0;

    const scoreResult = await pool.query(
      'INSERT INTO scores (player_id, score, direction) VALUES ($1, $2, $3) RETURNING id, player_id, score, direction, created_at',
      [playerId, score, direction]
    );

    // Update player_stats row
    await pool.query(
      `INSERT INTO player_stats (player_id, total_rounds, best_score, avg_speed_ms, updated_at)
       VALUES ($1, 1, $2, $3, NOW())
       ON CONFLICT (player_id) DO UPDATE
       SET total_rounds = player_stats.total_rounds + 1,
           best_score   = GREATEST(player_stats.best_score, EXCLUDED.best_score),
           avg_speed_ms = (player_stats.avg_speed_ms * player_stats.total_rounds + EXCLUDED.avg_speed_ms) / (player_stats.total_rounds + 1),
           updated_at   = NOW()`,
      [playerId, score, speedMs]
    );

    const missedIds = Array.isArray(word_ids)
      ? word_ids
      : Array.isArray(missed_word_ids)
      ? missed_word_ids
      : [];

    if (missedIds.length > 0) {
      for (const wordId of missedIds) {
        const parsedWordId = parseId(wordId);
        await pool.query(
          `INSERT INTO user_missed_words (player_id, word_id, total_miss_count, last_failed_at)
           VALUES ($1, $2, 1, NOW())
           ON CONFLICT (player_id, word_id)
           DO UPDATE SET total_miss_count = user_missed_words.total_miss_count + 1, last_failed_at = NOW()`,
          [playerId, parsedWordId]
        );
      }
    }

    res.status(201).json(scoreResult.rows[0]);
  } catch (error) {
    next(error);
  }
}
