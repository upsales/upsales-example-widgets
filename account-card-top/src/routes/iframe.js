const router = require('express').Router();
const UpsalesAPI = require('../api/upsales');
const logger = require('../helpers/log');
const axios = require('axios');
const errorsHelper = require('../helpers/errorsHelper');


const createIframeTitle = (text) => `<div style="font-size:14px;">${text}</div>`;
const createIframeEmptyRow = () => '<div style="font-size:12px;">&nbsp;</div>';
const createIframeHighlight = (highlightedText, text) => `<div style="font-size:16px;text-align:center;width:100%;"><span style="font-weight:600;">${highlightedText}</span><span>&nbsp;${text}</span></div>`;

const htmlDoc = (content) => `<!DOCTYPE html><html><head></head><body>${content}</body></html>`;

const openActivities = async (upsalesApi, req) => {
	const openActivities = await upsalesApi.widgets.getOpenActivities({ clientId: req.body.data.objectId, countOnly: true });
	const html = `
		${createIframeTitle('Open activities')}
		${createIframeEmptyRow()}
		${createIframeHighlight(openActivities.activities, 'activities')}
		${createIframeEmptyRow()}
		${createIframeHighlight(openActivities.appointments, 'appointments')}
	`;
	return htmlDoc(html);
};

router.post('/', async (req, res) => {
	var html;
	const upsalesApi = UpsalesAPI(
		{ apiKey: req.body.apiKey, apiPath: req.body.apiPath },
		{ axios, errorsHelper, logger }
	);

	switch (req.body.data.name) {
		case 'openActivities':
			html = await openActivities(upsalesApi, req);

			return res.send(html);
	}

	return res.send(html);
});

module.exports = router;
