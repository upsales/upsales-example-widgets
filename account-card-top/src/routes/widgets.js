const router = require('express').Router();
const UpsalesAPI = require('../api/upsales');
const logger = require('../helpers/log');
const axios = require('axios');
const errorsHelper = require('../helpers/errorsHelper');
const Components = require('../helpers/components');
const Click = require('../helpers/click');

const cleanValue = (value) => {
	return Math.round(value).toLocaleString();
};

router.post('/salesLast12Months', async (req, res) => {
	const upsalesApi = UpsalesAPI(
		{ apiKey: req.body.apiKey, apiPath: req.body.apiPath },
		{ axios, errorsHelper, logger }
	);
	const { sales, total } = await upsalesApi.widgets.getSales(req.body.data.object.id);
	const masterCurrency = await upsalesApi.currency.getMasterCurrency();

	const salesRows = sales.map(sale => Components.Row({
		cols: [
			Components.PlainText({ text: `${sale.text}: `}),
			Components.PlainText({ text: `${cleanValue(sale.value)} ${masterCurrency}` })
		],
		align: 'space-between'
	}));

	const rows  = [
		Components.PlainText({ text: 'Sales last 12 months', icon: 'fa-dollar', size: 'md' }),
		Components.EmptyRow(),
		...salesRows,
		Components.EmptyRow(),
		Components.Row({
			cols: [Components.PlainText({ text: `${cleanValue(total.value)} ${masterCurrency}`, style: 'bold' })],
			align: 'right'
		})
	];

	return res.send({ rows });
});

router.post('/agreement', async (req, res) => {
	const hasActiveAgreement = await UpsalesAPI(
		{ apiKey: req.body.apiKey, apiPath: req.body.apiPath },
		{ axios, errorsHelper, logger }
	).widgets.getHasActiveAgreement(req.body.data.object.id);

	const displayText = hasActiveAgreement ? 'YES' : 'NO';

	const rows = [
		Components.PlainText({ text: 'Active agreement', icon: 'fa-check', size: 'md' }),
		Components.EmptyRow(),
		Components.Row({
			cols: [Components.Title({ text: displayText, style: 'bold' })],
			align: 'center'
		})
	];

	return res.send({ rows });
});

router.post('/upcomingMeetings6Months', async (req, res) => {
	const openMeetings = (await UpsalesAPI(
		{ apiKey: req.body.apiKey, apiPath: req.body.apiPath },
		{ axios, errorsHelper, logger }
	).widgets.getOpenActivities({ clientId: req.body.data.object.id, getActivities: false })).appointments;

	const meetingRows = openMeetings.map(meeting => Components.Text({
		text: meeting.description,
		icon: 'fa-calendar-o',
		click: Click.Navigate({ to: 'appointment', id: { id: meeting.id } })
	}));

	const rows  = [
		Components.PlainText({ text: 'Upcoming meetings 6 months', icon: 'fa-calendar', size: 'md' }),
		Components.EmptyRow(),
		...meetingRows
	];

	return res.send({ rows });
});

const getActivityIcon = (activityType) => {
	switch(activityType) {
		case 'Todo': return 'fa-check-square-o';
		case 'Phonecall': return 'fa-phone';
		default: return 'fa-list-ol';
	}
};

router.post('/upcomingActivities6Months', async (req, res) => {
	const openActivities = (await UpsalesAPI(
		{ apiKey: req.body.apiKey, apiPath: req.body.apiPath },
		{ axios, errorsHelper, logger }
	).widgets.getOpenActivities({ clientId: req.body.data.object.id, getAppointments: false })).activities;

	const activityRows = openActivities.map(activity => Components.Text({
		text: activity.description,
		icon: getActivityIcon(activity.activityType.name),
		click: Click.Navigate({ to: 'activity', id: { id: activity.id } })
	}));

	const rows  = [
		Components.PlainText({ text: 'Upcoming activities 6 months', icon: 'fa-list-ul', size: 'md' }),
		Components.EmptyRow(),
		...activityRows
	];

	return res.send({ rows });
});

module.exports = router;