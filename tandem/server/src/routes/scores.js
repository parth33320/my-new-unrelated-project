import { Router } from 'express';
import { createScore } from '../controllers/scores.js';
const router = Router();
router.post('/', createScore);
export default router;
