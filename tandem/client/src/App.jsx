import { NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Game from './pages/Game.jsx';
import Results from './pages/Results.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <>
      <header className="site-header">
        <NavLink className="brand" to="/">Tandem</NavLink>
        <nav aria-label="Main navigation">
          <NavLink to="/game">Play</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/results" element={<Results />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<section><h1>Page not found</h1><NavLink to="/">Go home</NavLink></section>} />
        </Routes>
      </main>
    </>
  );
}
