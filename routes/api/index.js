const router = require('express').Router();
const authRoutes = require('./authRoutes');
const lanternRoutes = require('./lanternRoutes');

router.use('/auth', authRoutes);
router.use('/lanterns', lanternRoutes);

module.exports = router;
