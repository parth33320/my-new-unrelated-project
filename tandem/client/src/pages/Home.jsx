import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import Spinner from '../components/Spinner.jsx';
import '../styles/Home.css';

export default function Home() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setPlayer } = usePlayer();
  const navigate = useNavigate();

  const handleStart = async (direction) => {
    const trimmed = username.trim();
    if (trimmed.length < 2 || trimmed.length > 24) {
      setError('Username must be between 2 and 24 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const player = await api('/players', {
        method: 'POST',
        body: JSON.stringify({ username: trimmed }),
      });
      setPlayer(player);
      navigate('/game', { state: { direction } });
    } catch (err) {
      if (err.status === 409 || err.message?.toLowerCase().includes('taken')) {
        setError('That username is taken');
      } else {
        setError(err.message || 'Failed to create player. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="home-container">
      <p className="eyebrow">Chinese × Japanese</p>
      <h1>Words in common.</h1>
      <p className="home-subtitle">
        Test your vocabulary knowledge across cognates and false friends between Chinese and Japanese.
      </p>

      <div className="home-form">
        <label htmlFor="username-input" className="form-label">
          Enter your username:
        </label>
        <input
          id="username-input"
          type="text"
          className="username-input"
          placeholder="e.g. KanjiMaster"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (error) setError(null);
          }}
          minLength={2}
          maxLength={24}
          disabled={loading}
        />

        {error && <p className="error-text">{error}</p>}

        {loading && <Spinner size="medium" />}

        <div className="direction-buttons">
          <button
            type="button"
            className="start-btn ja-btn"
            onClick={() => handleStart('zh-ja')}
            disabled={loading || username.trim().length < 2 || username.trim().length > 24}
          >
            I know Chinese → guess Japanese
          </button>
          <button
            type="button"
            className="start-btn zh-btn"
            onClick={() => handleStart('ja-zh')}
            disabled={loading || username.trim().length < 2 || username.trim().length > 24}
          >
            I know Japanese → guess Chinese
          </button>
        </div>
      </div>
    </section>
  );
}
