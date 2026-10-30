import { useState, useEffect } from 'react';
import '../styles/Game.css';

export default function GamePage() {
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    fetch('/api/words/random')
      .then((res) => res.json())
      .then((data) => {
        setWord(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch word:', err);
        setLoading(false);
      });
  }, []);

  const handleAnswerClick = (option) => {
    setSelectedAnswer(option);
    console.log('Player selected answer:', option);
  };

  if (loading) {
    return <section className="game-container"><p>Loading word...</p></section>;
  }

  if (!word) {
    return <section className="game-container"><p>Error loading word.</p></section>;
  }

  return (
    <section className="game-container">
      <h1>Tracer Bullet Game</h1>
      <div className="kanji-display" style={{ fontSize: '3rem', margin: '1rem 0' }}>
        {word.jp_form}
      </div>
      <div className="answer-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
        {word.options && word.options.map((option, index) => (
          <button
            key={index}
            className="answer-btn"
            onClick={() => handleAnswerClick(option)}
            style={{ padding: '0.75rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
          >
            {option}
          </button>
        ))}
      </div>
      {selectedAnswer && (
        <p className="selected-result" style={{ marginTop: '1rem' }}>
          Selected: <strong>{selectedAnswer}</strong>
        </p>
      )}
    </section>
  );
}
