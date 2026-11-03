import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateAverageSpeed, calculateSimilarityPercent } from '../../client/src/utils/speed.js';

describe('calculateAverageSpeed', () => {
  it('calculateAverageSpeed([]) returns 0.0', () => {
    assert.equal(calculateAverageSpeed([]), 0.0);
  });

  it('calculateAverageSpeed([3.2, 4.1, 5.3]) returns 4.2', () => {
    assert.equal(calculateAverageSpeed([3.2, 4.1, 5.3]), 4.2);
  });

  it('correctly calculates average speed and rounds to 1 decimal place for various inputs', () => {
    // [2, 3, 4] -> 9 / 3 = 3.0
    const times2 = [2, 3, 4];
    assert.equal(calculateAverageSpeed(times2), 3.0);

    // [10, 10, 10, 10] -> 10.0
    const times3 = [10, 10, 10, 10];
    assert.equal(calculateAverageSpeed(times3), 10.0);

    // [1.25, 2.35] -> 3.6 / 2 = 1.8
    const times4 = [1.25, 2.35];
    assert.equal(calculateAverageSpeed(times4), 1.8);
  });

  it('handles empty array or invalid inputs safely', () => {
    assert.equal(calculateAverageSpeed([]), 0.0);
    assert.equal(calculateAverageSpeed(null), 0.0);
    assert.equal(calculateAverageSpeed(undefined), 0.0);
  });
});

describe('Similarity % formula (trueCount / questions.length * 100, rounded)', () => {
  it('calculates rounded similarity percentage with known inputs', () => {
    // 4 out of 10 -> 40%
    assert.equal(calculateSimilarityPercent(4, 10), 40);

    // 5 out of 10 -> 50%
    assert.equal(calculateSimilarityPercent(5, 10), 50);

    // 0 out of 10 -> 0%
    assert.equal(calculateSimilarityPercent(0, 10), 0);

    // 10 out of 10 -> 100%
    assert.equal(calculateSimilarityPercent(10, 10), 100);

    // 1 out of 3 -> 33.333% rounds to 33%
    assert.equal(calculateSimilarityPercent(1, 3), 33);

    // 2 out of 3 -> 66.666% rounds to 67%
    assert.equal(calculateSimilarityPercent(2, 3), 67);

    // 1 out of 7 -> 14.285% rounds to 14%
    assert.equal(calculateSimilarityPercent(1, 7), 14);

    // 5 out of 7 -> 71.428% rounds to 71%
    assert.equal(calculateSimilarityPercent(5, 7), 71);
  });

  it('handles empty or zero total questions gracefully with default 50', () => {
    assert.equal(calculateSimilarityPercent(0, 0), 50);
    assert.equal(calculateSimilarityPercent(null, null), 50);
    assert.equal(calculateSimilarityPercent(undefined, 0), 50);
  });
});
