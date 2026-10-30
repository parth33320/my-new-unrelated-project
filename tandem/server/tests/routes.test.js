import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';

describe('GET /api/words/random', () => {
  it('returns one hardcoded word row', async () => {
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
      server.close();
    }
  });
});
