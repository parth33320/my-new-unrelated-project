import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { pool } from '../src/db/pool.js';

describe('GET /api/words/random', () => {
  it('returns one word row from database pool', async () => {
    const originalQuery = pool.query;
    pool.query = async (sql) => {
      return {
        rows: [
          {
            id: 1,
            jp_form: '海軍',
            meaning_ja: 'navy',
            options: ['navy', 'army', 'air force', 'police']
          }
        ]
      };
    };

    const server = app.listen(0);
    const address = server.address();
    const port = address.port;

    try {
      const res = await fetch(`http://localhost:${port}/api/words/random`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.id, 1);
      assert.equal(data.jp_form, '海軍');
      assert.equal(data.meaning_ja, 'navy');
      assert.ok(Array.isArray(data.options));
      assert.equal(data.options.length, 4);
    } finally {
      pool.query = originalQuery;
      server.close();
    }
  });
});
