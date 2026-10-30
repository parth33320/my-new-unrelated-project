import { useSound } from '../hooks/useSound.js';
import '../styles/MuteToggle.css';

export default function MuteToggle({ isMuted: externalMuted, onToggle }) {
  const sound = useSound();
  const isMuted = externalMuted !== undefined ? externalMuted : sound.isMuted;
  const toggle = onToggle || sound.toggleMute;

  return (
    <button
      type="button"
      className={`mute-toggle-btn ${isMuted ? 'muted' : ''}`}
      onClick={toggle}
      aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
      title={isMuted ? 'Unmute sound' : 'Mute sound'}
    >
      {isMuted ? '🔇 Muted' : '🔊 Sound On'}
    </button>
  );
}
