import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/auth/github', (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    return res.status(503).json({ error: 'GitHub OAuth not configured on this server.' });
  }
  passport.authenticate('github', { scope: ['read:user'] })(req, res, next);
});

router.get(
  '/auth/github/callback',
  (req, res, next) => {
    passport.authenticate('github', { failureRedirect: '/' })(req, res, next);
  },
  (req, res) => {
    res.redirect('/');
  }
);

router.post('/auth/logout', (req, res, next) => {
  if (!req.logout) return res.json({ ok: true });
  req.logout((err) => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

router.get('/api/me', (req, res) => {
  if (req.user) {
    return res.json({
      id: req.user.id,
      username: req.user.username,
      avatar_url: req.user.avatar_url,
    });
  }
  res.json(null);
});

export default router;
