const router = require('express').Router();
const agreementEditTrigger = require('../controllers/agreementedit');
const logger = require('../helpers/log');
const { isApiUser } = require('../helpers/upsalesMethods');

router.post('/', async (req, res) => {
	if(isApiUser(req)){
		logger.info('Not scheduling message from API-user');
		logger.info(req.body.user);
		return res.sendStatus(200);
	}

	try {
		const modifiedSubscription = await agreementEditTrigger(req);
		return res.send(modifiedSubscription);
	} catch(err) {
		logger.error('Error', err);
		return res.sendStatus(500);
	}
});

module.exports = router;