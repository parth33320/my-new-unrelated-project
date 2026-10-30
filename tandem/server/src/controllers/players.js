import { pool } from '../db/pool.js';
import { httpError, parseId, parseUsername } from '../utils/validation.js';

export async function createPlayer(req, res, next) {
  try {
    const username = parseUsername(req.body?.username);
    const result = await pool.query(
      'INSERT INTO players (username) VALUES ($1) RETURNING id, username, created_at',
      [username]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function getPlayer(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const playerResult = await pool.query(
      'SELECT id, username, created_at FROM players WHERE id = $1',
      [id]
    );
    if (playerResult.rows.length === 0) {
      throw httpError(404, 'Player not found.');
    }
    const scoresResult = await pool.query(
      'SELECT id, score, direction, created_at FROM scores WHERE player_id = $1 ORDER BY created_at DESC LIMIT 10',
      [id]
    );
    const missedResult = await pool.query(
      `SELECT umw.word_id, umw.total_miss_count, umw.last_failed_at, w.jp_form, w.zh_simplified, w.meaning_ja, w.meaning_zh
       FROM user_missed_words umw
       JOIN words w ON umw.word_id = w.id
       WHERE umw.player_id = $1
       ORDER BY umw.total_miss_count DESC`,
      [id]
    );
    res.json({
      ...playerResult.rows[0],
      scores: scoresResult.rows,
      missed_words: missedResult.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function renamePlayer(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const username = parseUsername(req.body?.username);
    const result = await pool.query(
      'UPDATE players SET username = $1 WHERE id = $2 RETURNING id, username, created_at',
      [username, id]
    );
    if (result.rows.length === 0) {
      throw httpError(404, 'Player not found.');
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function deletePlayer(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const result = await pool.query(
      'DELETE FROM players WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      throw httpError(404, 'Player not found.');
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
