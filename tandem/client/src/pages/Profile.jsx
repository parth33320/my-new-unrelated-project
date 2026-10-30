import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import Spinner from '../components/Spinner.jsx';
import '../styles/Profile.css';

export default function Profile() {
  const { player, setPlayer } = usePlayer();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  const fetchProfile = useCallback(async (playerId) => {
    if (!playerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api(`/players/${playerId}`);
      setProfileData(data);
      setNewUsername(data.username);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (player?.id) {
      fetchProfile(player.id);
    }
  }, [player, fetchProfile]);

  const handleRename = async (e) => {
    e.preventDefault();
    const trimmed = newUsername.trim();
    if (trimmed.length < 2 || trimmed.length > 24) {
      setError('Username must be 2–24 characters.');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const updated = await api(`/players/${player.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ username: trimmed }),
      });
      setPlayer(updated);
      setProfileData((prev) => ({ ...prev, username: updated.username }));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to rename player:', err);
      if (err.status === 409 || err.message?.toLowerCase().includes('taken')) {
        setError('That username is taken.');
      } else {
        setError(err.message || 'Failed to rename player.');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? All scores will be removed.')) return;
    setDeleting(true);
    setError(null);
    try {
      await api(`/players/${player.id}`, { method: 'DELETE' });
      setPlayer(null);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete profile:', err);
      setError(err.message || 'Failed to delete profile.');
    } finally {
      setDeleting(false);
    }
  };

  if (!player) {
    return (
      <section className="profile-container empty-state">
        <h1>Player Profile</h1>
        <p>No player profile loaded. Create or select a username on the Home page to get started!</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
          Go to Home
        </button>
      </section>
    );
  }

  return (
    <section className="profile-container">
      <h1>Player Profile</h1>

      {loading ? (
        <div className="loading-container">
          <Spinner size="large" />
          <p>Loading profile...</p>
        </div>
      ) : (
        <div className="profile-card">
          <div className="profile-header">
            <div className="username-section">
              {!isEditing ? (
                <div className="username-display">
                  <h2>{profileData?.username || player.username}</h2>
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                    disabled={updating || deleting}
                  >
                    ✏️ Edit
                  </button>
                </div>
              ) : (
                <form className="rename-form" onSubmit={handleRename}>
                  <input
                    type="text"
                    className="rename-input"
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value);
                      if (error) setError(null);
                    }}
                    minLength={2}
                    maxLength={24}
                    disabled={updating}
                  />
                  <button type="submit" className="save-btn" disabled={updating}>
                    {updating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setNewUsername(profileData?.username || player.username);
                      setError(null);
                    }}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>

            <button
              type="button"
              className="delete-btn"
              onClick={handleDelete}
              disabled={updating || deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Profile'}
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}

          {(updating || deleting) && <Spinner size="medium" />}

          <div className="profile-body">
            <div className="scores-section">
              <h3>10 Recent Scores</h3>
              {profileData?.scores && profileData.scores.length > 0 ? (
                <ul className="scores-list">
                  {profileData.scores.map((scoreItem) => (
                    <li key={scoreItem.id} className="score-item">
                      <span className="score-points">{scoreItem.score} pts</span>
                      <span className="score-dir">
                        {scoreItem.direction === 'zh-ja' ? 'ZH → JA' : 'JA → ZH'}
                      </span>
                      <span className="score-date">
                        {new Date(scoreItem.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No scores logged yet.</p>
              )}
            </div>

            <div className="missed-words-section">
              <h3>Missed Words</h3>
              {profileData?.missed_words && profileData.missed_words.length > 0 ? (
                <ul className="missed-words-list">
                  {profileData.missed_words.map((item) => (
                    <li key={item.word_id} className="missed-word-item">
                      <div className="missed-header">
                        <span className="missed-kanji">{item.jp_form || item.zh_simplified}</span>
                        <span className="miss-count-tag">Missed {item.total_miss_count}×</span>
                      </div>
                      <div className="missed-details">
                        <span><strong>Japanese:</strong> {item.meaning_ja}</span>
                        <span><strong>Chinese:</strong> {item.meaning_zh}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No missed words recorded!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
