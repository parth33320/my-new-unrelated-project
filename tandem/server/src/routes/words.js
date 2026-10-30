import { Router } from 'express';
import { getRound } from '../controllers/words.js';
import { pool } from '../db/pool.js';

const router = Router();

router.get('/round', getRound);

router.get('/random', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM words LIMIT 1');
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }
    // Fallback for hardcoded tracer bullet slice if table empty
    res.json({
      id: 1,
      jp_form: '海軍',
      meaning_ja: 'navy',
      options: ['navy', 'army', 'air force', 'police']
    });
  } catch (error) {
    // Fallback if database is not connected
    res.json({
      id: 1,
      jp_form: '海軍',
      meaning_ja: 'navy',
      options: ['navy', 'army', 'air force', 'police']
    });
  }
});

export default router;
