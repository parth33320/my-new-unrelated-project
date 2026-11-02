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

/**
 * Calculates similarity percentage as trueCount / totalQuestions * 100, rounded to nearest whole percentage.
 * @param {number} trueCount - Count of true friend words
 * @param {number} totalQuestions - Total number of questions
 * @returns {number} Rounded percentage (0 - 100)
 */
export function calculateSimilarityPercent(trueCount, totalQuestions) {
  if (!totalQuestions || typeof totalQuestions !== 'number' || totalQuestions <= 0) {
    return 50; // Fallback default when no questions provided
  }
  const count = typeof trueCount === 'number' && !isNaN(trueCount) ? Math.max(0, trueCount) : 0;
  return Math.round((count / totalQuestions) * 100);
}
