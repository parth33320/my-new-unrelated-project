import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildRound } from '../src/utils/buildRound.js';

const wordsData = JSON.parse(
  await readFile(new URL('../data/words.json', import.meta.url), 'utf8')
);

// Map words from JSON with id assigned (like DB records)
const sampleWords = wordsData.slice(0, 50).map((w, index) => ({
  id: index + 1,
  ...w,
}));

describe('buildRound', () => {
  it('RED: throws when called with an empty array', () => {
    assert.throws(() => {
      buildRound([], 'zh-ja');
    });
  });

  it('GREEN: correctly generates a 10-question round from seeded words', () => {
    const directions = ['zh-ja', 'ja-zh'];

    for (const direction of directions) {
      const round = buildRound(sampleWords, direction);

      // returns exactly 10 questions
      assert.equal(round.length, 10);

      // first question is not relation "false"
      assert.notEqual(round[0].relation, 'false');

      const seenWordIds = new Set();

      for (const q of round) {
        // no duplicate words in the round
        assert.equal(seenWordIds.has(q.wordId), false, `Duplicate wordId: ${q.wordId}`);
        seenWordIds.add(q.wordId);

        // every question has exactly 4 choices
        assert.equal(q.choices.length, 4);

        // correctIndex is always 0-3
        assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3);

        // correct choice matches expected correct answer based on direction
        const word = sampleWords.find((w) => w.id === q.wordId);
        const expectedCorrect = direction === 'zh-ja' ? word.meaning_ja : word.meaning_zh;
        assert.equal(q.choices[q.correctIndex], expectedCorrect);

        // check reveal structure
        assert.deepEqual(Object.keys(q.reveal).sort(), [
          'jp_form',
          'jp_reading',
          'meaning_ja',
          'meaning_zh',
          'pinyin',
          'zh_simplified',
        ].sort());
      }
    }
  });
});
