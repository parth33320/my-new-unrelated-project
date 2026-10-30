import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { pool } from '../src/db/pool.js';

describe('Deck CRUD & Reset API Tests', () => {
  it('handles Deck CRUD and title validation', async () => {
    let mockPlayerId = 1;
    let mockDeckId = 10;
    let decksDb = [];
    let deckWordsDb = [];

    const originalQuery = pool.query;
    pool.query = async (sql, params) => {
      const trimmed = sql.trim().toUpperCase();

      if (trimmed.startsWith('INSERT INTO DECKS')) {
        const [pId, title] = params;
        const newDeck = { id: mockDeckId, player_id: pId, deck_title: title, created_at: new Date().toISOString() };
        decksDb.push(newDeck);
        return { rows: [newDeck] };
      }

      if (trimmed.startsWith('SELECT') && trimmed.includes('FROM DECKS D')) {
        const [pId] = params;
        const rows = decksDb
          .filter((d) => d.player_id === pId)
          .map((d) => {
            const words = deckWordsDb
              .filter((dw) => dw.deck_id === d.id)
              .map((dw) => dw.word);
            return { ...d, words };
          });
        return { rows };
      }

      if (trimmed.startsWith('UPDATE DECKS')) {
        const [title, id] = params;
        const deck = decksDb.find((d) => d.id === id);
        if (deck) {
          deck.deck_title = title;
          return { rows: [deck] };
        }
        return { rows: [] };
      }

      if (trimmed.startsWith('SELECT') && trimmed.includes('FROM DECK_WORDS DW')) {
        const [id] = params;
        const words = deckWordsDb.filter((dw) => dw.deck_id === id).map((dw) => dw.word);
        return { rows: words };
      }

      if (trimmed.startsWith('DELETE FROM DECKS')) {
        const [id] = params;
        const index = decksDb.findIndex((d) => d.id === id);
        if (index !== -1) {
          const [deleted] = decksDb.splice(index, 1);
          deckWordsDb = deckWordsDb.filter((dw) => dw.deck_id !== id);
          return { rows: [deleted] };
        }
        return { rows: [] };
      }

      if (trimmed.startsWith('SELECT ID FROM DECKS')) {
        const [id] = params;
        const deck = decksDb.find((d) => d.id === id);
        return { rows: deck ? [deck] : [] };
      }

      if (trimmed.startsWith('SELECT ID FROM WORDS')) {
        return { rows: [{ id: params[0] }] };
      }

      if (trimmed.startsWith('INSERT INTO DECK_WORDS')) {
        const [deckId, wordId] = params;
        deckWordsDb.push({
          deck_id: deckId,
          word_id: wordId,
          word: { id: wordId, jp_form: '海軍', zh_simplified: '海军', meaning_ja: 'navy', meaning_zh: 'navy' },
        });
        return { rows: [] };
      }

      if (trimmed.startsWith('DELETE FROM DECK_WORDS')) {
        const [deckId, wordId] = params;
        deckWordsDb = deckWordsDb.filter((dw) => !(dw.deck_id === deckId && dw.word_id === wordId));
        return { rows: [] };
      }

      if (trimmed.startsWith('TRUNCATE')) {
        decksDb = [];
        deckWordsDb = [];
        return { rows: [] };
      }

      return { rows: [] };
    };

    const server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://localhost:${port}`;

    try {
      // 1. Create Deck with blank title -> 400
      let res = await fetch(`${baseUrl}/api/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: mockPlayerId, deck_title: '   ' }),
      });
      assert.equal(res.status, 400);

      // 2. Create Deck with valid title -> 201
      res = await fetch(`${baseUrl}/api/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: mockPlayerId, deck_title: 'N5 Vocab' }),
      });
      assert.equal(res.status, 201);
      const createdDeck = await res.json();
      assert.equal(createdDeck.deck_title, 'N5 Vocab');

      // 3. GET /api/decks?player_id=1 -> lists created deck
      res = await fetch(`${baseUrl}/api/decks?player_id=${mockPlayerId}`);
      assert.equal(res.status, 200);
      let list = await res.json();
      assert.equal(list.length, 1);
      assert.equal(list[0].deck_title, 'N5 Vocab');

      // 4. PATCH /api/decks/10 with whitespace title -> 400
      res = await fetch(`${baseUrl}/api/decks/${mockDeckId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck_title: '' }),
      });
      assert.equal(res.status, 400);

      // 5. PATCH /api/decks/10 with new title -> 200
      res = await fetch(`${baseUrl}/api/decks/${mockDeckId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck_title: 'N4 Vocab' }),
      });
      assert.equal(res.status, 200);
      const updatedDeck = await res.json();
      assert.equal(updatedDeck.deck_title, 'N4 Vocab');

      // 6. POST /api/decks/10/words -> add word
      res = await fetch(`${baseUrl}/api/decks/${mockDeckId}/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word_id: 101 }),
      });
      assert.equal(res.status, 201);

      // GET decks again to confirm word is present
      res = await fetch(`${baseUrl}/api/decks?player_id=${mockPlayerId}`);
      list = await res.json();
      assert.equal(list[0].words.length, 1);
      assert.equal(list[0].words[0].id, 101);

      // 7. DELETE /api/decks/10/words/101 -> remove word
      res = await fetch(`${baseUrl}/api/decks/${mockDeckId}/words/101`, {
        method: 'DELETE',
      });
      assert.equal(res.status, 200);

      // 8. DELETE /api/decks/10 -> delete deck
      res = await fetch(`${baseUrl}/api/decks/${mockDeckId}`, {
        method: 'DELETE',
      });
      assert.equal(res.status, 200);

      // GET decks again -> empty list
      res = await fetch(`${baseUrl}/api/decks?player_id=${mockPlayerId}`);
      list = await res.json();
      assert.equal(list.length, 0);

      // 9. POST /api/reset -> 200 { message: "Database reset." }
      res = await fetch(`${baseUrl}/api/reset`, { method: 'POST' });
      assert.equal(res.status, 200);
      const resetMsg = await res.json();
      assert.equal(resetMsg.message, 'Database reset.');
    } finally {
      pool.query = originalQuery;
      server.close();
    }
  });
});
