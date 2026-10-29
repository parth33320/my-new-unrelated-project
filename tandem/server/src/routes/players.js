import { Router } from 'express';
import { createPlayer, getPlayer, renamePlayer, deletePlayer } from '../controllers/players.js';
const router = Router();
router.post('/', createPlayer);
router.get('/:id', getPlayer);
router.patch('/:id', renamePlayer);
router.delete('/:id', deletePlayer);
export default router;
