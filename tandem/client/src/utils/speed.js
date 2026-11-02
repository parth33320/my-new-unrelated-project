/**
 * Calculates average answer speed in seconds rounded to 1 decimal place.
 * @param {number[]} elapsedTimes - Array of elapsed seconds per question
 * @returns {number} Average speed in seconds rounded to 1 decimal place (e.g. 4.2)
 */
export function calculateAverageSpeed(elapsedTimes) {
  if (!Array.isArray(elapsedTimes) || elapsedTimes.length === 0) {
    return 0.0;
  }
  const sum = elapsedTimes.reduce((acc, t) => acc + Number(t || 0), 0);
  const avg = sum / elapsedTimes.length;
  return Number(avg.toFixed(1));
}
