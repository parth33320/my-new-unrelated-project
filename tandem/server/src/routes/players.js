import { Router } from 'express';
import {
  createPlayer,
  getPlayer,
  renamePlayer,
  deletePlayer,
  getPlayerStats,
  recalculateStats,
  uploadAvatar,
} from '../controllers/players.js';
import upload from '../middleware/upload.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
router.post('/', createPlayer);
router.get('/:id', getPlayer);
router.get('/:id/stats', getPlayerStats);
router.post('/:id/recalculate-stats', recalculateStats);
router.post('/:id/avatar', requireAuth, upload.single('avatar'), uploadAvatar);
router.patch('/:id', renamePlayer);
router.delete('/:id', deletePlayer);
export default router;
