import { Router } from 'express';
import { getRound } from '../controllers/words.js';
import { pool } from '../db/pool.js';

const router = Router();

router.get('/round', getRound);

router.get('/random', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM words LIMIT 1');
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const queryStr = req.query.q || req.query.search || '';
    if (queryStr.trim()) {
      const searchPattern = `%${queryStr.trim()}%`;
      const result = await pool.query(
        `SELECT id, jp_form, zh_simplified, zh_traditional, meaning_ja, meaning_zh
         FROM words
         WHERE jp_form ILIKE $1
            OR zh_simplified ILIKE $1
            OR meaning_ja ILIKE $1
            OR meaning_zh ILIKE $1
         ORDER BY id ASC
         LIMIT 20`,
        [searchPattern]
      );
      res.json(result.rows);
    } else {
      const result = await pool.query(
        'SELECT id, jp_form, zh_simplified, zh_traditional, meaning_ja, meaning_zh FROM words ORDER BY id ASC LIMIT 50'
      );
      res.json(result.rows);
    }
  } catch (error) {
    next(error);
  }
});

export default router;
