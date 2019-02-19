const router = require('express').Router();
const passport = require('../../utils/middleware/passport-auth');
// const db = require('../../models');

// match /api/auth
router.get('/', passport.authenticate('auth0'), (req, res) => {
  res.redirect('/');
});

// match /api/auth/callback
router.get('/callback', passport.authenticate('auth0', { failureRedirect: '/login' }), (req, res) => {
  if (!req.user) {
    throw new Error('user null');
  }
  res.redirect('http://localhost:3000');
});

module.exports = router;
