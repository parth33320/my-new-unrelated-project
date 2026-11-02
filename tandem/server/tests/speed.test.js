import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateAverageSpeed } from '../../client/src/utils/speed.js';

describe('calculateAverageSpeed', () => {
  it('correctly calculates average speed and rounds to 1 decimal place', () => {
    // [3.2, 4.1, 5.3] -> 12.6 / 3 = 4.2
    const times1 = [3.2, 4.1, 5.3];
    assert.equal(calculateAverageSpeed(times1), 4.2);

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
