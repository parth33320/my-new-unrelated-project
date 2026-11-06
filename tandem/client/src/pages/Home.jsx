import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import Spinner from '../components/Spinner.jsx';
import '../styles/Home.css';

export default function Home() {
  const { player, setPlayer } = usePlayer();
  const [username, setUsername] = useState(player?.username || '');
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectMessage = location.state?.message;

  useEffect(() => {
    if (player?.username) {
      setUsername(player.username);
    }
  }, [player]);

  const handleStart = async (direction) => {
    const trimmed = username.trim();
    if (trimmed.length < 2 || trimmed.length > 24) {
      setError('Username must be between 2 and 24 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const playerRes = await api('/players', {
        method: 'POST',
        body: JSON.stringify({ username: trimmed }),
      });
      setPlayer(playerRes);
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

      {redirectMessage && (
        <div className="redirect-notice alert-warning" role="alert" style={{ margin: '1rem 0', color: '#c53030', fontWeight: 'bold' }}>
          {redirectMessage}
        </div>
      )}

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
            title={username.trim().length < 2 ? 'Enter a username first' : ''}
            onClick={() => handleStart('zh-ja')}
            disabled={loading || username.trim().length < 2 || username.trim().length > 24}
          >
            I know Chinese → guess Japanese
          </button>
          <button
            type="button"
            className="start-btn zh-btn"
            title={username.trim().length < 2 ? 'Enter a username first' : ''}
            onClick={() => handleStart('ja-zh')}
            disabled={loading || username.trim().length < 2 || username.trim().length > 24}
          >
            I know Japanese → guess Chinese
          </button>
        </div>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={async () => {
            setIsResetting(true);
            try {
              await api('/reset', { method: 'POST' });
              toast.success('Database reset.');
              setTimeout(() => window.location.reload(), 500);
            } catch (err) {
              toast.error('Reset failed.');
            } finally {
              setIsResetting(false);
            }
          }}
          disabled={isResetting}
          style={{
            fontSize: '0.8rem',
            padding: '4px 10px',
            backgroundColor: '#e2e8f0',
            color: '#4a5568',
            border: '1px solid #cbd5e0',
            borderRadius: '4px',
            cursor: isResetting ? 'not-allowed' : 'pointer',
            opacity: isResetting ? 0.6 : 1,
          }}
        >
          {isResetting ? 'Resetting DB...' : 'Reset DB'}
        </button>
      </div>
    </section>
  );
}
