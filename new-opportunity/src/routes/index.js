const router = require('express').Router();

router.use('/widget', require('./widget'));

module.exports = router;