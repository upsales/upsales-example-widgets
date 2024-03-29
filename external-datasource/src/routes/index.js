const router = require('express').Router();

router.use('/version', require('./version'));
router.use('/health', require('./health'));
router.use('/status', require('./status'));
router.use('/fieldValues', require('./fieldValues'));
router.use('/client', require('./client'));
//router.use(require('./orderTrigger'));

module.exports = router;