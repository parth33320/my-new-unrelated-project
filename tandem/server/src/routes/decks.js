import { Router } from 'express';
import {
  getDecks,
  createDeck,
  updateDeck,
  deleteDeck,
  addWordToDeck,
  removeWordFromDeck,
} from '../controllers/decks.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', getDecks);
router.post('/', requireAuth, createDeck);
router.patch('/:id', requireAuth, updateDeck);
router.delete('/:id', requireAuth, deleteDeck);
router.post('/:id/words', requireAuth, addWordToDeck);
router.delete('/:id/words/:wordId', requireAuth, removeWordFromDeck);

export default router;
