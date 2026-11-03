import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildRound } from '../src/utils/buildRound.js';
import { app } from '../src/app.js';
import { pool } from '../src/db/pool.js';

const REQUIRED_REVEAL_FIELDS = [
  'jp_form',
  'zh_simplified',
  'jp_reading',
  'pinyin',
  'meaning_ja',
  'meaning_zh',
  'relation',
];

const wordsData = JSON.parse(
  await readFile(new URL('../data/words.json', import.meta.url), 'utf8')
);

const sampleWords = wordsData.slice(0, 50).map((w, index) => ({
  id: index + 1,
  ...w,
}));

describe('Feature 2 — Dynamic Word Reveal Cards Unit & API Tests (Stories 5–7)', () => {
  let server;
  let baseUrl;
  let originalQuery;

  before(async () => {
    originalQuery = pool.query;

    // Use pool mock pattern from features7-10.test.js for server tests (no real DB needed)
    pool.query = async (sql, params = []) => {
      const sqlLower = sql.toLowerCase();
      if (sqlLower.includes('select * from words')) {
        return {
          rows: sampleWords,
        };
      }
      return { rows: [] };
    };

    server = app.listen(0);
    const { port } = server.address();
    baseUrl = `http://localhost:${port}`;
  });

  after(() => {
    pool.query = originalQuery;
    server.close();
  });

  it('buildRound question objects contain all reveal fields: jp_form, zh_simplified, jp_reading, pinyin, meaning_ja, meaning_zh, relation', () => {
    const round = buildRound(sampleWords, 'zh-ja');
    assert.equal(round.length, 10);

    for (const q of round) {
      assert.ok(q.reveal, 'Question must have a reveal object');
      for (const field of REQUIRED_REVEAL_FIELDS) {
        assert.ok(
          field in q.reveal,
          `Expected reveal object to contain field "${field}"`
        );
      }
    }
  });

  it("reveal.relation is one of 'true', 'false', 'partial'", () => {
    const round = buildRound(sampleWords, 'zh-ja');
    assert.equal(round.length, 10);

    for (const q of round) {
      assert.ok(
        ['true', 'false', 'partial'].includes(q.reveal.relation),
        `Expected reveal.relation to be 'true', 'false', or 'partial', but received '${q.reveal.relation}'`
      );
    }
  });

  it('GET /api/words/round?direction=zh-ja returns 200 and each question’s reveal object has all 7 fields (use pool mock pattern from features7-10.test.js)', async () => {
    const res = await fetch(`${baseUrl}/api/words/round?direction=zh-ja`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.direction, 'zh-ja');
    assert.ok(Array.isArray(data.questions));
    assert.equal(data.questions.length, 10);

    for (const q of data.questions) {
      assert.ok(q.reveal, 'Question in response must contain a reveal object');
      for (const field of REQUIRED_REVEAL_FIELDS) {
        assert.ok(
          field in q.reveal,
          `Expected question.reveal to contain field "${field}"`
        );
      }
    }
  });
});
