import { pool } from '../db/pool.js';
import { httpError, parseDirection } from '../utils/validation.js';
import { buildRound } from '../utils/buildRound.js';
import { SCORING } from '../config/scoring.js';

export async function getRound(req, res, next) {
  try {
    const direction = parseDirection(req.query.direction);
    const result = await pool.query('SELECT * FROM words');
    const questions = buildRound(result.rows, direction);
    res.json({ questions, scoring: SCORING, direction });
  } catch (error) {
    next(error);
  }
}
