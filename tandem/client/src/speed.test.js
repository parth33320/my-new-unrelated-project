import { describe, it, expect } from 'vitest';
import { calculateAverageSpeed } from './utils/speed.js';

describe('client utils: calculateAverageSpeed', () => {
  it('correctly calculates average elapsed time and rounds to 1 decimal place', () => {
    expect(calculateAverageSpeed([2.0, 4.0])).toBe(3.0);
    expect(calculateAverageSpeed([1.23, 2.34, 3.45])).toBe(2.3);
  });

  it('handles empty or non-array inputs safely by returning 0.0', () => {
    expect(calculateAverageSpeed([])).toBe(0.0);
    expect(calculateAverageSpeed(null)).toBe(0.0);
  });
});
