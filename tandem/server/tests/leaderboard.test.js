import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { pool } from '../src/db/pool.js';

describe('Feature 6: Split Direction Leaderboards + Reset API Tests', () => {
  it('GET /api/leaderboard?direction=zh-ja returns 200 with array', async () => {
    const originalQuery = pool.query;
    pool.query = async (sql, params) => {
      assert.equal(params[0], 'zh-ja');
      return {
        rows: [
          { player_id: 1, username: 'player_zh', best_score: 90, last_played_at: '2026-11-01T00:00:00.000Z' }
        ]
      };
    };

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/api/leaderboard?direction=zh-ja`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.direction, 'zh-ja');
      assert.ok(Array.isArray(data.entries));
      assert.equal(data.entries.length, 1);
      assert.equal(data.entries[0].username, 'player_zh');
    } finally {
      pool.query = originalQuery;
      server.close();
    }
  });

  it('GET /api/leaderboard?direction=ja-zh returns 200 with array', async () => {
    const originalQuery = pool.query;
    pool.query = async (sql, params) => {
      assert.equal(params[0], 'ja-zh');
      return {
        rows: [
          { player_id: 2, username: 'player_ja', best_score: 85, last_played_at: '2026-11-01T01:00:00.000Z' }
        ]
      };
    };

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/api/leaderboard?direction=ja-zh`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.direction, 'ja-zh');
      assert.ok(Array.isArray(data.entries));
      assert.equal(data.entries.length, 1);
      assert.equal(data.entries[0].username, 'player_ja');
    } finally {
      pool.query = originalQuery;
      server.close();
    }
  });

  it('GET /api/leaderboard?direction=zh-ja&sort=date returns 200', async () => {
    const originalQuery = pool.query;
    pool.query = async (sql, params) => {
      assert.equal(params[0], 'zh-ja');
      assert.ok(sql.includes('ORDER BY last_played_at DESC, best_score DESC'));
      return {
        rows: [
          { player_id: 1, username: 'player_recent', best_score: 70, last_played_at: '2026-11-02T12:00:00.000Z' }
        ]
      };
    };

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/api/leaderboard?direction=zh-ja&sort=date`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.direction, 'zh-ja');
      assert.equal(data.sort, 'date');
      assert.ok(Array.isArray(data.entries));
      assert.equal(data.entries[0].username, 'player_recent');
    } finally {
      pool.query = originalQuery;
      server.close();
    }
  });

  it('GET /api/leaderboard with no direction param returns 400', async () => {
    const originalQuery = pool.query;
    pool.query = async () => ({ rows: [] });

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/api/leaderboard`);
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.error);
    } finally {
      pool.query = originalQuery;
      server.close();
    }
  });

  it('POST /api/reset returns 200; subsequent GET /api/leaderboard?direction=zh-ja returns empty array', async () => {
    let databaseTruncated = false;
    const originalQuery = pool.query;
    pool.query = async (sql, params) => {
      const trimmed = sql.trim().toUpperCase();
      if (trimmed.startsWith('TRUNCATE')) {
        databaseTruncated = true;
        return { rows: [] };
      }
      if (sql.includes('FROM scores')) {
        if (databaseTruncated) {
          return { rows: [] };
        }
        return {
          rows: [{ player_id: 1, username: 'player1', best_score: 95, last_played_at: '2026-11-01' }]
        };
      }
      return { rows: [] };
    };

    const server = app.listen(0);
    const port = server.address().port;

    try {
      const resetRes = await fetch(`http://localhost:${port}/api/reset`, { method: 'POST' });
      assert.equal(resetRes.status, 200);
      const resetData = await resetRes.json();
      assert.equal(resetData.message, 'Database reset.');

      const getRes = await fetch(`http://localhost:${port}/api/leaderboard?direction=zh-ja`);
      assert.equal(getRes.status, 200);
      const getData = await getRes.json();
      assert.ok(Array.isArray(getData.entries));
      assert.equal(getData.entries.length, 0);
    } finally {
      pool.query = originalQuery;
      server.close();
    }
  });

  describe('Security Tests', () => {
    it('GET /api/leaderboard?direction=zh-ja; DROP TABLE scores;-- returns 400', async () => {
      const originalQuery = pool.query;
      let queryExecuted = false;
      pool.query = async () => {
        queryExecuted = true;
        return { rows: [] };
      };

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const malicious = encodeURIComponent('zh-ja; DROP TABLE scores;--');
        const res = await fetch(`http://localhost:${port}/api/leaderboard?direction=${malicious}`);
        assert.equal(res.status, 400);
        assert.equal(queryExecuted, false, 'Malicious SQL query should never reach pool.query');
        const data = await res.json();
        assert.ok(data.error);
      } finally {
        pool.query = originalQuery;
        server.close();
      }
    });

    it('POST /api/reset requires no auth and does not expose sensitive data', async () => {
      const originalQuery = pool.query;
      pool.query = async () => ({ rows: [] });

      const server = app.listen(0);
      const port = server.address().port;

      try {
        const res = await fetch(`http://localhost:${port}/api/reset`, {
          method: 'POST'
        });
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.deepEqual(Object.keys(data), ['message']);
        assert.equal(data.message, 'Database reset.');
        // Ensure no internal info, tokens, passwords, database names, or stack traces are present
        const jsonStr = JSON.stringify(data);
        assert.ok(!jsonStr.toLowerCase().includes('password'));
        assert.ok(!jsonStr.toLowerCase().includes('token'));
        assert.ok(!jsonStr.toLowerCase().includes('secret'));
        assert.ok(!jsonStr.toLowerCase().includes('stack'));
      } finally {
        pool.query = originalQuery;
        server.close();
      }
    });
  });
});
