import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import Spinner from './Spinner.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { player } = usePlayer();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Spinner size="large" />
      </div>
    );
  }

  // Allow either GitHub authenticated user or active player session
  if (!user && !player) {
    return <Navigate to="/" state={{ message: 'Login required.', from: location.pathname }} replace />;
  }

  return children;
}
