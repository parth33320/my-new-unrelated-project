import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { pool } from '../db/pool.js';

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || 'https://my-new-unrelated-project.onrender.com/auth/github/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const githubId = String(profile.id);
          const avatarUrl = profile.photos?.[0]?.value || profile._json?.avatar_url || null;
          let username = (profile.username || `gh_${githubId}`).slice(0, 24);

          // Find existing player by github_id
          const existing = await pool.query('SELECT * FROM players WHERE github_id = $1', [githubId]);
          if (existing.rows.length > 0) {
            return done(null, existing.rows[0]);
          }

          // Ensure username uniqueness
          let candidate = username;
          let suffix = 1;
          while (true) {
            const check = await pool.query('SELECT id FROM players WHERE lower(username) = lower($1)', [candidate]);
            if (check.rows.length === 0) break;
            suffix += 1;
            const suffixStr = `_${suffix}`;
            candidate = candidate.slice(0, 24 - suffixStr.length) + suffixStr;
          }

          const insertRes = await pool.query(
            `INSERT INTO players (username, github_id, avatar_url)
             VALUES ($1, $2, $3)
             RETURNING id, username, github_id, avatar_url, created_at`,
            [candidate, githubId, avatarUrl]
          );
          const newPlayer = insertRes.rows[0];

          await pool.query(
            'INSERT INTO player_stats (player_id) VALUES ($1) ON CONFLICT DO NOTHING',
            [newPlayer.id]
          );

          return done(null, newPlayer);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const res = await pool.query('SELECT id, username, github_id, avatar_url, created_at FROM players WHERE id = $1', [id]);
    if (res.rows.length === 0) return done(null, null);
    done(null, res.rows[0]);
  } catch (err) {
    done(err);
  }
});

export default passport;
