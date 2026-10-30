import { ROUND_COUNTS, ROUND_SIZE } from '../config/scoring.js';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Rules:
// - Select 5 true, 3 false, 2 partial friends (ROUND_SIZE=10)
// - First question must not be a false friend
// - zh-ja: show jp_form, correct = meaning_ja, trap = meaning_zh
// - ja-zh: show zh_simplified, correct = meaning_zh, trap = meaning_ja
// - 4 choices: correct + 3 distractors for true friends
// - 4 choices: correct + trap + 2 distractors for false/partial
// - Shuffle choices so correct is not always in same position
// - Return array of 10 question objects
export function buildRound(words, direction = 'zh-ja') {
  if (!Array.isArray(words) || words.length < ROUND_SIZE) {
    throw new Error(`Insufficient words available to build a round of size ${ROUND_SIZE}.`);
  }

  const trueWords = shuffle(words.filter((w) => w.relation === 'true'));
  const falseWords = shuffle(words.filter((w) => w.relation === 'false'));
  const partialWords = shuffle(words.filter((w) => w.relation === 'partial'));

  const selectedTrue = trueWords.slice(0, ROUND_COUNTS.true);
  const selectedFalse = falseWords.slice(0, ROUND_COUNTS.false);
  const selectedPartial = partialWords.slice(0, ROUND_COUNTS.partial);

  let selected = [...selectedTrue, ...selectedFalse, ...selectedPartial];

  // Fill up to ROUND_SIZE if any relation category was short
  if (selected.length < ROUND_SIZE) {
    const selectedIds = new Set(selected.map((w) => w.id ?? w));
    const remaining = shuffle(words.filter((w) => !selectedIds.has(w.id ?? w)));
    selected = selected.concat(remaining.slice(0, ROUND_SIZE - selected.length));
  }

  selected = shuffle(selected);

  // Ensure first question is not a false friend (if possible)
  if (selected[0].relation === 'false') {
    const nonFalseIndex = selected.findIndex((w) => w.relation !== 'false');
    if (nonFalseIndex > 0) {
      [selected[0], selected[nonFalseIndex]] = [selected[nonFalseIndex], selected[0]];
    }
  }

  return selected.map((word) => {
    const isZhJa = direction === 'zh-ja';
    const display = isZhJa ? word.jp_form : word.zh_simplified;
    const correct = isZhJa ? word.meaning_ja : word.meaning_zh;
    const trap = isZhJa ? word.meaning_zh : word.meaning_ja;

    const rawDistractors = Array.isArray(word.distractors) ? word.distractors : [];
    let unshuffledChoices;

    if (word.relation === 'true') {
      let distractors = rawDistractors.filter((d) => d !== correct);
      if (distractors.length < 3) {
        const extra = words
          .map((w) => (isZhJa ? w.meaning_ja : w.meaning_zh))
          .filter((m) => m !== correct && !distractors.includes(m));
        distractors = [...distractors, ...shuffle(extra)];
      }
      unshuffledChoices = [correct, ...distractors.slice(0, 3)];
    } else {
      // false or partial
      let distractors = rawDistractors.filter((d) => d !== correct && d !== trap);
      if (distractors.length < 2) {
        const extra = words
          .map((w) => (isZhJa ? w.meaning_ja : w.meaning_zh))
          .filter((m) => m !== correct && m !== trap && !distractors.includes(m));
        distractors = [...distractors, ...shuffle(extra)];
      }
      unshuffledChoices = [correct, trap, ...distractors.slice(0, 2)];
    }

    const choices = shuffle(unshuffledChoices);
    const correctIndex = choices.indexOf(correct);

    return {
      wordId: word.id,
      display,
      choices,
      correctIndex,
      relation: word.relation,
      reveal: {
        jp_form: word.jp_form,
        zh_simplified: word.zh_simplified,
        meaning_ja: word.meaning_ja,
        meaning_zh: word.meaning_zh,
        jp_reading: word.jp_reading,
        pinyin: word.pinyin,
      },
    };
  });
}
