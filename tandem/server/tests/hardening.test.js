import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { app, playersPostLimiter } from '../src/app.js';
import { pool } from '../src/db/pool.js';

describe('Security and Hardening Regression Tests', () => {
  it('POST /api/reset in production env returns 403', async () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const server = app.listen(0);
    const { port } = server.address();

    try {
      const res = await fetch(`http://localhost:${port}/api/reset`, {
        method: 'POST',
      });
      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.error, 'Forbidden');
    } finally {
      process.env.NODE_ENV = prevEnv;
      server.close();
    }
  });

  it('DELETE /api/players/1 with mismatched player_id returns 403', async () => {
    const server = app.listen(0);
    const { port } = server.address();

    try {
      // 1. Mismatched player_id in body
      let res = await fetch(`http://localhost:${port}/api/players/1`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: 2 }),
      });
      assert.equal(res.status, 403);
      let data = await res.json();
      assert.equal(data.error, 'Forbidden');

      // 2. Mismatched x-player-id header
      res = await fetch(`http://localhost:${port}/api/players/1`, {
        method: 'DELETE',
        headers: { 'x-player-id': '99' },
      });
      assert.equal(res.status, 403);

      // 3. No player_id provided
      res = await fetch(`http://localhost:${port}/api/players/1`, {
        method: 'DELETE',
      });
      assert.equal(res.status, 403);
    } finally {
      server.close();
    }
  });

  it('PATCH /api/players/1 with mismatched player_id returns 403', async () => {
    const server = app.listen(0);
    const { port } = server.address();

    try {
      const res = await fetch(`http://localhost:${port}/api/players/1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'newname', player_id: 2 }),
      });
      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.error, 'Forbidden');
    } finally {
      server.close();
    }
  });

  it('PATCH /api/decks/:id with wrong playerId returns 403 and nonexistent returns 404', async () => {
    const originalQuery = pool.query;
    pool.query = async (sql, params) => {
      const trimmed = sql.trim().toUpperCase();
      if (trimmed.startsWith('SELECT PLAYER_ID FROM DECKS WHERE ID = $1')) {
        const [id] = params;
        if (id === 10) return { rows: [{ player_id: 1 }] };
        return { rows: [] };
      }
      return { rows: [] };
    };

    const server = app.listen(0);
    const { port } = server.address();

    try {
      // Nonexistent deck -> 404
      let res = await fetch(`http://localhost:${port}/api/decks/999`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: 1, deck_title: 'Updated' }),
      });
      assert.equal(res.status, 404);

      // Wrong playerId -> 403
      res = await fetch(`http://localhost:${port}/api/decks/10`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: 2, deck_title: 'Updated' }),
      });
      assert.equal(res.status, 403);
      let data = await res.json();
      assert.equal(data.error, 'Forbidden');

      // Missing playerId -> 403
      res = await fetch(`http://localhost:${port}/api/decks/10`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck_title: 'Updated' }),
      });
      assert.equal(res.status, 403);
    } finally {
      pool.query = originalQuery;
      server.close();
    }
  });

  it('POST /api/players 11th request from same IP returns 429', async () => {
    // Test the rate limiter directly on a fresh test router to ensure clean counter state
    const testApp = express();
    testApp.use(express.json());
    testApp.post('/api/players', playersPostLimiter, (req, res) => {
      res.status(201).json({ id: 1, username: 'player' });
    });

    const server = testApp.listen(0);
    const { port } = server.address();

    try {
      for (let i = 1; i <= 10; i++) {
        const res = await fetch(`http://localhost:${port}/api/players`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: `user${i}` }),
        });
        assert.equal(res.status, 201, `Request ${i} should succeed`);
      }

      // 11th request should be rate-limited
      const res11 = await fetch(`http://localhost:${port}/api/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'user11' }),
      });
      assert.equal(res11.status, 429);
      const data = await res11.json();
      assert.deepEqual(data, { error: 'Too many requests, slow down.' });
    } finally {
      server.close();
    }
  });

  it('POST /api/scores with 21 missedIds returns 400', async () => {
    const server = app.listen(0);
    const { port } = server.address();

    try {
      const missedIds = Array.from({ length: 21 }, (_, i) => i + 1);
      const res = await fetch(`http://localhost:${port}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: 1,
          score: 100,
          direction: 'zh-ja',
          word_ids: missedIds,
        }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.error, 'Too many missed word IDs');
    } finally {
      server.close();
    }
  });

  it('POST /api/scores with score=99999 returns 400', async () => {
    const server = app.listen(0);
    const { port } = server.address();

    try {
      const res = await fetch(`http://localhost:${port}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: 1,
          score: 99999,
          direction: 'zh-ja',
          word_ids: [1, 2],
        }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.error, 'Invalid score');
    } finally {
      server.close();
    }
  });

  it('POST /api/scores rolls back transaction on error', async () => {
    let rolledBack = false;
    let released = false;

    const originalConnect = pool.connect;
    pool.connect = async () => {
      return {
        query: async (sql) => {
          if (sql === 'BEGIN') return {};
          if (typeof sql === 'string' && sql.includes('INSERT INTO scores')) {
            throw new Error('Database insert failed');
          }
          if (sql === 'ROLLBACK') {
            rolledBack = true;
            return {};
          }
          return {};
        },
        release: () => {
          released = true;
        },
      };
    };

    const server = app.listen(0);
    const { port } = server.address();

    try {
      const res = await fetch(`http://localhost:${port}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: 1,
          score: 100,
          direction: 'zh-ja',
          word_ids: [1],
        }),
      });
      assert.equal(res.status, 500);
      assert.equal(rolledBack, true, 'Transaction should have been rolled back');
      assert.equal(released, true, 'Client should have been released');
    } finally {
      pool.connect = originalConnect;
      server.close();
    }
  });
});
