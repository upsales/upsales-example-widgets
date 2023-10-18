const router = require('express').Router();

router.use(require('./orderTrigger'));
router.use(require('./validateOrder'));

module.exports = router;