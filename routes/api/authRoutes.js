const router = require('express').Router();
const passport = require('../../utils/middleware/passport-auth');
const db = require('../../models');
const promiseHandler = require('../../utils/promiseHandler');
require('dotenv').config();

// match /api/auth
router.get('/', passport.authenticate('auth0'), (req, res) => {
  res.redirect('/');
});

router.get('/check', (req, res) => {
  if (req.user) {
    console.log({ ...req.user, status: true });
    return res.json({ ...req.user, status: true });
  }
  return res.json({ status: false });
});

// match /api/auth/callback
router.get(
  '/callback',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  async (req, res) => {
    if (!req.user) {
      throw new Error('user null');
    }
    /*
    req.user.displayName
    req.user.picture
    req.user.user_id
  */
    console.log(req.user);

    const [err, dbUser] = await promiseHandler(
      db.Users.findOneAndUpdate(
        {
          user_id: req.user.user_id,
        },
        {
          user_id: req.user.user_id,
          picture: req.user.picture,
          displayName: req.user.displayName,
        },
        {
          upsert: true,
          new: true,
        },
      ),
    );

    if (err) {
      console.log(err);
    }
    console.log(dbUser);
    
    res.redirect(process.env.REDIRECTURI);
  },
);

module.exports = router;
