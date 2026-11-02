import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildRound } from '../src/utils/buildRound.js';
import { app } from '../src/app.js';
import { pool } from '../src/db/pool.js';

const wordsData = JSON.parse(
  await readFile(new URL('../data/words.json', import.meta.url), 'utf8')
);

// Map words from JSON with id assigned (like DB records)
const sampleWords = wordsData.slice(0, 50).map((w, index) => ({
  id: index + 1,
  ...w,
}));

describe('buildRound Unit Tests', () => {
  it('buildRound returns exactly 10 questions for a valid word pool', () => {
    const round = buildRound(sampleWords, 'zh-ja');
    assert.equal(round.length, 10);
  });

  it('buildRound with only true+false words (no partial) still returns 10 questions via fallback', () => {
    const trueAndFalseOnly = [
      ...wordsData.filter((w) => w.relation === 'true').slice(0, 10).map((w, i) => ({ id: i + 1, ...w })),
      ...wordsData.filter((w) => w.relation === 'false').slice(0, 10).map((w, i) => ({ id: i + 20, ...w })),
    ];
    // Verify no partial words exist in this pool
    assert.equal(trueAndFalseOnly.some((w) => w.relation === 'partial'), false);

    const round = buildRound(trueAndFalseOnly, 'zh-ja');
    assert.equal(round.length, 10);
  });

  it('buildRound throws if word pool is empty', () => {
    assert.throws(() => {
      buildRound([], 'zh-ja');
    });
  });

  it('Each question has wordId, display, choices (array of 4), correctIndex, relation, reveal', () => {
    const round = buildRound(sampleWords, 'zh-ja');
    assert.equal(round.length, 10);

    for (const q of round) {
      assert.ok(typeof q.wordId === 'number' || typeof q.wordId === 'string');
      assert.ok(typeof q.display === 'string' && q.display.length > 0);
      assert.ok(Array.isArray(q.choices) && q.choices.length === 4);
      assert.ok(typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3);
      assert.ok(['true', 'false', 'partial'].includes(q.relation));
      assert.ok(typeof q.reveal === 'object' && q.reveal !== null);
      assert.deepEqual(Object.keys(q.reveal).sort(), [
        'jp_form',
        'jp_reading',
        'meaning_ja',
        'meaning_zh',
        'pinyin',
        'relation',
        'zh_simplified',
      ].sort());
    }
  });
});

describe('GET /api/words/round Integration & Security Tests', () => {
  it('GET /api/words/round?direction=zh-ja returns 200 with { questions, direction } against real Render DB', async () => {
    const server = app.listen(0);
    const { port } = server.address();
    try {
      const res = await fetch(`http://localhost:${port}/api/words/round?direction=zh-ja`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.direction, 'zh-ja');
      assert.ok(Array.isArray(data.questions));
      assert.equal(data.questions.length, 10);
      for (const q of data.questions) {
        assert.ok(q.wordId);
        assert.ok(q.display);
        assert.equal(q.choices.length, 4);
        assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3);
        assert.ok(q.relation);
        assert.ok(q.reveal);
      }
    } finally {
      server.close();
    }
  });

  it('GET /api/words/round with missing direction param returns 400', async () => {
    const server = app.listen(0);
    const { port } = server.address();
    try {
      const res = await fetch(`http://localhost:${port}/api/words/round`);
      assert.equal(res.status, 400);
    } finally {
      server.close();
    }
  });

  it("GET /api/words/round?direction='; DROP TABLE words; -- returns 400 and words table still exists", async () => {
    const server = app.listen(0);
    const { port } = server.address();
    try {
      const res = await fetch(
        `http://localhost:${port}/api/words/round?direction=${encodeURIComponent("'; DROP TABLE words; --")}`
      );
      assert.equal(res.status, 400);

      // Verify words table still exists in DB
      const dbCheck = await pool.query('SELECT count(*) FROM words');
      assert.ok(Number(dbCheck.rows[0].count) > 0);
    } finally {
      server.close();
    }
  });

  it('GET /api/words/round?direction=<script>alert(1)</script> returns 400', async () => {
    const server = app.listen(0);
    const { port } = server.address();
    try {
      const res = await fetch(
        `http://localhost:${port}/api/words/round?direction=${encodeURIComponent('<script>alert(1)</script>')}`
      );
      assert.equal(res.status, 400);
    } finally {
      server.close();
    }
  });
});
