import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { pool } from '../src/db/pool.js';

describe('Features 7 & Security Backend Tests: Error Handling, Status Codes, JSON payloads', () => {
  let server;
  let port;
  let baseUrl;
  let originalQuery;

  before(async () => {
    originalQuery = pool.query;
    // Mock database responses for predictable unit/integration testing
    pool.query = async (sql, params = []) => {
      const sqlLower = sql.toLowerCase();
      // Unknown IDs mock: return empty rows
      if (params.includes(999999)) {
        return { rows: [] };
      }
      if (sqlLower.includes('from players where id = $1')) {
        return { rows: [{ id: 1, username: 'testuser', created_at: new Date() }] };
      }
      if (sqlLower.includes('from decks where id = $1')) {
        return { rows: [{ id: 1, player_id: 1, deck_title: 'Test Deck', created_at: new Date() }] };
      }
      if (sqlLower.includes('from words where id = $1')) {
        return { rows: [{ id: 1, jp_form: '海軍' }] };
      }
      if (sqlLower.includes('select * from words')) {
        return {
          rows: Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            jp_form: `Word${i + 1}`,
            zh_simplified: `WordZH${i + 1}`,
            meaning_ja: `MeaningJA${i + 1}`,
            meaning_zh: `MeaningZH${i + 1}`,
            distractors: ['dist1', 'dist2', 'dist3'],
            relation: 'true',
          })),
        };
      }
      return { rows: [] };
    };

    server = app.listen(0);
    port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  after(() => {
    pool.query = originalQuery;
    server.close();
  });

  describe('Feature 7 — Error Handling (JSON { error: string } on failure)', () => {
    it('GET /api/words/round returns JSON { error: string } on invalid direction', async () => {
      const res = await fetch(`${baseUrl}/api/words/round?direction=invalid-dir`);
      assert.equal(res.status, 400);
      assert.match(res.headers.get('content-type'), /application\/json/);
      const data = await res.json();
      assert.ok(typeof data.error === 'string');
      assert.ok(data.error.length > 0);
      assert.ok(!data.error.includes('<html'));
    });

    it('POST /api/players returns JSON { error: string } on invalid username', async () => {
      const res = await fetch(`${baseUrl}/api/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'a' }), // too short
      });
      assert.equal(res.status, 400);
      assert.match(res.headers.get('content-type'), /application\/json/);
      const data = await res.json();
      assert.ok(typeof data.error === 'string');
      assert.ok(data.error.length > 0);
    });

    it('POST /api/scores returns JSON { error: string } on missing/invalid score', async () => {
      const res = await fetch(`${baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: 1, score: -10, direction: 'zh-ja' }),
      });
      assert.equal(res.status, 400);
      assert.match(res.headers.get('content-type'), /application\/json/);
      const data = await res.json();
      assert.ok(typeof data.error === 'string');
      assert.ok(data.error.length > 0);
    });

    it('POST /api/decks returns JSON { error: string } on blank deck title', async () => {
      const res = await fetch(`${baseUrl}/api/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: 1, deck_title: '   ' }),
      });
      assert.equal(res.status, 400);
      assert.match(res.headers.get('content-type'), /application\/json/);
      const data = await res.json();
      assert.ok(typeof data.error === 'string');
      assert.ok(data.error.length > 0);
    });

    it('GET /api/leaderboard returns JSON { error: string } on invalid direction query', async () => {
      const res = await fetch(`${baseUrl}/api/leaderboard?direction=bad-direction`);
      assert.equal(res.status, 400);
      assert.match(res.headers.get('content-type'), /application\/json/);
      const data = await res.json();
      assert.ok(typeof data.error === 'string');
      assert.ok(data.error.length > 0);
    });
  });

  describe('Security Tests (cross-feature)', () => {
    it('All API routes return 404 (not 500) for unknown IDs', async () => {
      const unknownPlayer = await fetch(`${baseUrl}/api/players/999999`);
      assert.equal(unknownPlayer.status, 404);
      const playerData = await unknownPlayer.json();
      assert.equal(playerData.error, 'Player not found.');

      const unknownDeckDelete = await fetch(`${baseUrl}/api/decks/999999`, { method: 'DELETE' });
      assert.equal(unknownDeckDelete.status, 404);
      const deckData = await unknownDeckDelete.json();
      assert.equal(deckData.error, 'Deck not found.');

      const unknownWordDeckAdd = await fetch(`${baseUrl}/api/decks/999999/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word_id: 1 }),
      });
      assert.equal(unknownWordDeckAdd.status, 404);
      const wordDeckData = await unknownWordDeckAdd.json();
      assert.equal(wordDeckData.error, 'Deck not found.');
    });

    it('All API routes return 400 (not 500) for malformed request bodies', async () => {
      const routes = [
        { path: '/api/players', method: 'POST' },
        { path: '/api/scores', method: 'POST' },
        { path: '/api/decks', method: 'POST' },
      ];

      for (const { path, method } of routes) {
        const res = await fetch(`${baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: '{ malformed json: true, ',
        });
        assert.equal(res.status, 400, `Expected 400 for malformed JSON at ${path}`);
        const data = await res.json();
        assert.match(data.error, /valid JSON/i);
      }
    });

    it('No route exposes stack traces in response body', async () => {
      const endpoints = [
        `${baseUrl}/api/players/invalid-id`,
        `${baseUrl}/api/scores`,
        `${baseUrl}/api/decks/not-a-number`,
        `${baseUrl}/api/words/round?direction=random`,
        `${baseUrl}/api/leaderboard?direction=xyz`,
        `${baseUrl}/api/nonexistent-route`,
      ];

      for (const url of endpoints) {
        const res = await fetch(url);
        const text = await res.text();
        assert.ok(!text.includes('node_modules'), `Stack trace exposed in ${url}`);
        assert.ok(!text.includes('Error:'), `Stack trace exposed in ${url}`);
        assert.ok(!text.includes('at processTicksAndRejections'), `Stack trace exposed in ${url}`);
      }
    });

    it('Response headers include no sensitive server version info', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.equal(res.headers.get('x-powered-by'), null);
      assert.equal(res.headers.get('server'), null);
    });
  });
});
