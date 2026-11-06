import cloudinary from '../config/cloudinary.js';
import { pool } from '../db/pool.js';
import { httpError, parseId, parseUsername } from '../utils/validation.js';

export async function createPlayer(req, res, next) {
  try {
    const username = parseUsername(req.body?.username);
    const result = await pool.query(
      `INSERT INTO players (username) VALUES ($1)
       ON CONFLICT (lower(username)) DO UPDATE SET username = EXCLUDED.username
       RETURNING id, username, created_at`,
      [username]
    );
    const player = result.rows[0];
    await pool.query(
      'INSERT INTO player_stats (player_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [player.id]
    );
    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
}

export async function uploadAvatar(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (req.user && req.user.id !== id) {
      throw httpError(403, 'Forbidden: You can only update your own avatar.');
    }
    if (!req.file || !req.file.buffer) {
      throw httpError(400, 'Image file is required.');
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'tandem/avatars',
          public_id: `player_${id}`,
          overwrite: true,
          transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      uploadStream.end(req.file.buffer);
    });

    const url = result.secure_url;
    await pool.query(
      `INSERT INTO player_stats (player_id, avatar_url, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (player_id) DO UPDATE SET avatar_url = $2, updated_at = NOW()`,
      [id, url]
    );
    await pool.query('UPDATE players SET avatar_url = $1 WHERE id = $2', [url, id]);

    res.json({ avatar_url: url });
  } catch (error) {
    next(error);
  }
}

export async function getPlayerStats(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const result = await pool.query(
      'SELECT player_id, total_rounds, best_score, avg_speed_ms, updated_at FROM player_stats WHERE player_id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      throw httpError(404, 'Player stats not found.');
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function recalculateStats(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const scoresAgg = await pool.query(
      'SELECT COUNT(*)::int AS total_rounds, COALESCE(MAX(score), 0) AS best_score FROM scores WHERE player_id = $1',
      [id]
    );
    const totalRounds = scoresAgg.rows[0]?.total_rounds ?? 0;
    const bestScore = scoresAgg.rows[0]?.best_score ?? 0;

    await pool.query(
      `INSERT INTO player_stats (player_id, total_rounds, best_score, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (player_id) DO UPDATE
       SET total_rounds = EXCLUDED.total_rounds,
           best_score = EXCLUDED.best_score,
           updated_at = NOW()`,
      [id, totalRounds, bestScore]
    );
    res.json({ recalculated: true, total_rounds: totalRounds, best_score: bestScore });
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
