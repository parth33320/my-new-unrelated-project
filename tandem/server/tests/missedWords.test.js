import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { pool } from '../src/db/pool.js';

describe('Feature 4 — Personal Missed Words History (Controllers Test Suite)', () => {
  let playersDb = [];
  let scoresDb = [];
  let missedWordsDb = [];
  let nextPlayerId = 1;
  let nextScoreId = 1;

  // Mock words table data
  const wordsDb = [
    { id: 1, jp_form: '海軍', zh_simplified: '海军', meaning_ja: 'navy', meaning_zh: 'navy' },
    { id: 2, jp_form: '領域', zh_simplified: '领域', meaning_ja: 'area, domain', meaning_zh: 'domain; sphere' },
  ];

  it('handles scores and personal missed words tracking with local controllers', async () => {
    const originalQuery = pool.query;

    pool.query = async (sql, params) => {
      const trimmed = sql.trim();

      // INSERT INTO players (username)
      if (trimmed.startsWith('INSERT INTO players')) {
        const username = params[0];
        const newPlayer = { id: nextPlayerId++, username, created_at: new Date().toISOString() };
        playersDb.push(newPlayer);
        return { rows: [newPlayer] };
      }

      // SELECT id, username, created_at FROM players WHERE id = $1
      if (trimmed.startsWith('SELECT id, username, created_at FROM players WHERE id = $1')) {
        const id = params[0];
        const player = playersDb.find((p) => p.id === id);
        return { rows: player ? [player] : [] };
      }

      // SELECT id, score, direction, created_at FROM scores WHERE player_id = $1
      if (trimmed.startsWith('SELECT id, score, direction, created_at FROM scores WHERE player_id = $1')) {
        const playerId = params[0];
        const playerScores = scoresDb.filter((s) => s.player_id === playerId);
        return { rows: playerScores };
      }

      // SELECT umw.word_id, umw.total_miss_count ... FROM user_missed_words umw ...
      if (trimmed.includes('FROM user_missed_words umw')) {
        const playerId = params[0];
        const missed = missedWordsDb
          .filter((m) => m.player_id === playerId)
          .sort((a, b) => b.total_miss_count - a.total_miss_count)
          .map((m) => {
            const word = wordsDb.find((w) => w.id === m.word_id) || {};
            return {
              word_id: m.word_id,
              total_miss_count: m.total_miss_count,
              last_failed_at: m.last_failed_at,
              jp_form: word.jp_form,
              zh_simplified: word.zh_simplified,
              meaning_ja: word.meaning_ja,
              meaning_zh: word.meaning_zh,
            };
          });
        return { rows: missed };
      }

      // INSERT INTO scores (player_id, score, direction)
      if (trimmed.startsWith('INSERT INTO scores')) {
        const [playerId, score, direction] = params;
        const playerExists = playersDb.some((p) => p.id === playerId);
        if (!playerExists) {
          const err = new Error('insert or update on table "scores" violates foreign key constraint');
          err.code = '23503';
          throw err;
        }
        const newScore = {
          id: nextScoreId++,
          player_id: playerId,
          score,
          direction,
          created_at: new Date().toISOString(),
        };
        scoresDb.push(newScore);
        return { rows: [newScore] };
      }

      // INSERT INTO user_missed_words ... ON CONFLICT (player_id, word_id) DO UPDATE ...
      if (trimmed.startsWith('INSERT INTO user_missed_words')) {
        const [playerId, wordId] = params;
        const existing = missedWordsDb.find((m) => m.player_id === playerId && m.word_id === wordId);
        if (existing) {
          existing.total_miss_count += 1;
          existing.last_failed_at = new Date().toISOString();
        } else {
          missedWordsDb.push({
            player_id: playerId,
            word_id: wordId,
            total_miss_count: 1,
            last_failed_at: new Date().toISOString(),
          });
        }
        return { rows: [] };
      }

      return { rows: [] };
    };

    const server = app.listen(0);
    const { port } = server.address();
    const baseUrl = `http://localhost:${port}`;

    try {
      // Setup unique test player via local POST /api/players
      const uniqueUsername = `test_user_${Date.now()}`;
      let res = await fetch(`${baseUrl}/api/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uniqueUsername }),
      });
      assert.equal(res.status, 201);
      const player = await res.json();
      assert.ok(player.id);
      const playerId = player.id;

      // 1. POST /api/scores with { playerId, score, direction, word_ids: [id1, id2] } returns 201
      res = await fetch(`${baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          score: 80,
          direction: 'zh-ja',
          word_ids: [1, 2],
        }),
      });
      assert.equal(res.status, 201);
      const scoreData = await res.json();
      assert.equal(scoreData.player_id, playerId);

      // 2. After that POST, GET /api/players/:id response includes missed_words array with those word IDs
      res = await fetch(`${baseUrl}/api/players/${playerId}`);
      assert.equal(res.status, 200);
      let profile = await res.json();
      assert.ok(Array.isArray(profile.missed_words));
      assert.equal(profile.missed_words.length, 2);
      const wordIds = profile.missed_words.map((m) => m.word_id);
      assert.ok(wordIds.includes(1), 'missed_words must include word_id 1');
      assert.ok(wordIds.includes(2), 'missed_words must include word_id 2');
      const word1 = profile.missed_words.find((m) => m.word_id === 1);
      assert.equal(word1.total_miss_count, 1);

      // 3. Second POST /api/scores with same word ID increments total_miss_count to 2
      res = await fetch(`${baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          score: 70,
          direction: 'zh-ja',
          word_ids: [2],
        }),
      });
      assert.equal(res.status, 201);

      res = await fetch(`${baseUrl}/api/players/${playerId}`);
      assert.equal(res.status, 200);
      profile = await res.json();
      const word2 = profile.missed_words.find((m) => m.word_id === 2);
      assert.ok(word2);
      assert.equal(word2.total_miss_count, 2, 'total_miss_count should be 2 for word 2');

      // 4. missed_words array is sorted by total_miss_count DESC
      assert.ok(profile.missed_words.length >= 2);
      assert.equal(profile.missed_words[0].word_id, 2);
      assert.equal(profile.missed_words[0].total_miss_count, 2);
      assert.equal(profile.missed_words[1].word_id, 1);
      assert.equal(profile.missed_words[1].total_miss_count, 1);
      for (let i = 0; i < profile.missed_words.length - 1; i++) {
        assert.ok(profile.missed_words[i].total_miss_count >= profile.missed_words[i + 1].total_miss_count);
      }

      // 5. POST /api/scores with missing playerId returns 400
      res = await fetch(`${baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: 50,
          direction: 'zh-ja',
          word_ids: [1],
        }),
      });
      assert.equal(res.status, 400);
      const errMissing = await res.json();
      assert.ok(errMissing.error);

      // 6. POST /api/scores with non-existent playerId returns 404
      res = await fetch(`${baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: 99999999,
          score: 50,
          direction: 'zh-ja',
          word_ids: [1],
        }),
      });
      assert.equal(res.status, 404);
      const errNonExistent = await res.json();
      assert.equal(errNonExistent.error, 'Player or word not found.');

      // 7. Security: POST /api/scores with playerId: "1; DROP TABLE scores;" returns 400 (parameterized query protection)
      res = await fetch(`${baseUrl}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: '1; DROP TABLE scores;',
          score: 80,
          direction: 'zh-ja',
          word_ids: [1],
        }),
      });
      assert.equal(res.status, 400);
      const errSql = await res.json();
      assert.match(errSql.error, /positive integer/i);

      // 8. Security: GET /api/players/99999999 returns 404, not a server crash
      res = await fetch(`${baseUrl}/api/players/99999999`);
      assert.equal(res.status, 404);
      const errNotFound = await res.json();
      assert.equal(errNotFound.error, 'Player not found.');
    } finally {
      pool.query = originalQuery;
      server.close();
    }
  });
});
