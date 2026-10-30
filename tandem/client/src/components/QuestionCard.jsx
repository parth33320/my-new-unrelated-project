import '../styles/QuestionCard.css';

export default function QuestionCard({
  question,
  onAnswer,
  selectedChoiceIndex = null,
  disabled = false,
  direction = 'zh-ja',
}) {
  if (!question) return null;

  const targetLang = direction === 'zh-ja' ? 'Japanese (Kanji)' : 'Chinese (Hanzi)';
  const guessLang = direction === 'zh-ja' ? 'Japanese Meaning' : 'Chinese Meaning';

  return (
    <div className="question-card">
      <div className="question-meta">
        <span className="lang-tag">{targetLang}</span>
        <span className="prompt-text">Select the correct {guessLang}:</span>
      </div>

      <div className="kanji-display">{question.display}</div>

      <div className="choice-grid">
        {question.choices.map((choice, index) => {
          const isCorrect = index === question.correctIndex;
          const isSelected = index === selectedChoiceIndex;
          let btnClass = 'choice-btn';

          if (selectedChoiceIndex !== null) {
            if (isCorrect) {
              btnClass += ' correct';
            } else if (isSelected) {
              btnClass += ' wrong';
            }
          }

          return (
            <button
              key={index}
              className={btnClass}
              onClick={() => onAnswer(choice, index)}
              disabled={disabled || selectedChoiceIndex !== null}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
