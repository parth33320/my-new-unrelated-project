import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Results.css';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const {
    score = 0,
    questionsCount = 10,
    correctCount = 0,
    wrongWords = [],
    questions = [],
  } = state;

  const trueCount = questions.filter((q) => q.relation === 'true').length;
  const similarityPercent = questions.length > 0 ? Math.round((trueCount / questions.length) * 100) : 50;

  return (
    <section className="results-container">
      <h1>Game Results</h1>

      <div className="results-card">
        <div className="score-summary">
          <div className="stat-item">
            <span className="stat-label">Final Score</span>
            <span className="stat-value highlight">{score} pts</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Correct Answers</span>
            <span className="stat-value">{correctCount} / {questionsCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">True Friend Similarity</span>
            <span className="stat-value">{similarityPercent}%</span>
          </div>
        </div>

        <p className="similarity-explanation">
          {similarityPercent}% of the questions in this round were <strong>True Friends</strong> (same meaning in Japanese & Chinese).
        </p>

        {wrongWords.length > 0 ? (
          <div className="missed-words-section">
            <h3>Words to Review ({wrongWords.length})</h3>
            <ul className="missed-words-list">
              {wrongWords.map((q, idx) => (
                <li key={q.wordId || idx} className="missed-word-card">
                  <div className="missed-word-header">
                    <span className="missed-word-display">{q.display}</span>
                    <span className={`relation-badge relation-${q.relation}`}>
                      {q.relation === 'true' ? 'True Friend' : q.relation === 'false' ? 'False Friend' : 'Partial Friend'}
                    </span>
                  </div>
                  <div className="missed-word-meanings">
                    <div><strong>Japanese:</strong> {q.reveal?.meaning_ja}</div>
                    <div><strong>Chinese:</strong> {q.reveal?.meaning_zh}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="perfect-score-msg">
            🎉 Perfect round! You didn't miss any words!
          </div>
        )}

        <div className="results-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
            Play Again
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/leaderboard')}>
            Leaderboard
          </button>
        </div>
      </div>
    </section>
  );
}
