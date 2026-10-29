// The API sends these defaults with each round. Tune scoring here.
export const SCORING = Object.freeze({
  correct: 10,
  categoryPenalty: 2,
  sentencePenalty: 3,
  eliminateMultiplier: 0.5,
  timeout: 0,
});
export const ROUND_COUNTS = Object.freeze({ true: 5, false: 3, partial: 2 });
export const ROUND_SIZE = Object.values(ROUND_COUNTS).reduce((sum, n) => sum + n, 0);
export const QUESTION_SECONDS = 10;
