import '../styles/HintBar.css';

export default function HintBar({ category, onUseCategoryHint, categoryHintUsed, disabled }) {
  return (
    <div className="hint-bar-container">
      {!categoryHintUsed ? (
        <button
          type="button"
          className="hint-btn"
          onClick={onUseCategoryHint}
          disabled={disabled || categoryHintUsed}
        >
          💡 Hint: Category (-2 pts)
        </button>
      ) : (
        <div className="hint-revealed">
          💡 Category: <strong>{category || 'General'}</strong> (-2 pts)
        </div>
      )}
    </div>
  );
}
