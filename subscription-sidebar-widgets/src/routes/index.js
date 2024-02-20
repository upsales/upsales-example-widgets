const router = require('express').Router();

router.use('/version', require('./version'));
router.use('/health', require('./health'));
router.use('/status', require('./status'));
router.use('/widget', require('./widget'));
router.use('/iframe', require('./iframe'));

module.exports = router;