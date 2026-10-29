import { Router } from 'express';
import { getRound } from '../controllers/words.js';
const router = Router();
router.get('/round', getRound);
export default router;
