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

export default router;
