const moment = require('moment');
const errors = require('./errors');
const requiredInput = require('../../helpers/errorsHelper').requiredInput;

module.exports = function ({ apiKey, apiPath } = requiredInput('options'), { axios, errorsHelper, logger } = requiredInput('dependencies')) {
	const getSales = async (clientId) => {
		const optionsForUserSales = (userId) => ({
			method: 'GET',
			params: {
				aggs: [
					{'type': 'sum','field': 'valueInMasterCurrency'},
				],
				limit: 0,
				q: [
					{'a': 'stage.id','c': 'ne','v':[]},
					{'a': 'probability','c': 'eq','v':100},
					{'a': 'date','c': 'gt','v': moment().subtract(12, 'months').format()},
					{'or':{'q':[
						[{'a': 'client.id','c': 'eq','v': clientId}],
						[{'a': 'clientConnection.id','c': 'eq','v': clientId}]
					]}},
					{'a': 'user.id', 'c': 'eq', 'v': [userId]}
				]
			},
			url: `${apiPath}v2/1/report/api/order`,
			headers: {
				'Cookie': `token=${apiKey}`,
				'Content-Type': 'application/json'
			}
		});

		const userIds = [1, 9, 41];

		const optionsForUsers = {
			method: 'GET',
			params: {
				id: userIds,
				sort: { 'a':'id','s':'A' }
			},
			url: `${apiPath}v2/users`,
			headers: {
				'Cookie': `token=${apiKey}`,
				'Content-Type': 'application/json'
			}
		};

		try {
			logger.info('Getting Upsales sales...');

			logger.info('Sending Upsales API request to get sales...');
			const [userResponse, ...salesResponses] = await Promise.all([
				axios(optionsForUsers),
				...userIds.map(userId => axios(optionsForUserSales(userId)))
			]);
			logger.info('Upsales sales retrieved.');
			const sales = salesResponses.map(res => res.data.data);
			const users = userResponse.data.data;


			const salesRows = users.map((user, index) => ({
				text: user.name.split(' ').map(namePart => namePart[0].toUpperCase()).join(''),
				value: parseInt(sales[index].sum_valueInMasterCurrency.value)
			}));

			const totalSales = salesRows.reduce((total, sale) => {
				total += parseInt(sale.value);
				return total;
			}, 0);

			const total = { text: 'Total', value: totalSales };

			return { sales: salesRows, total };

		} catch (err) {
			const errorToReport = errorsHelper.wrapError(errors.UPSALES_GET_SALES_ERROR, err);
			logger.error(errorToReport);
			throw errorToReport;
		}
	};

	const getHasActiveAgreement = async (clientId) => {
		const now = moment().format('YYYY-MM-DDTHH:mm:ss');

		const options = {
			method: 'GET',
			url: `${apiPath}v2/agreements?q={"or":{"q":[[{"a":"client.id","c":"eq","v":${clientId}}],[{"a":"clientConnection.id","c":"eq","v":${clientId}}]]}}&q={"or":{"q":[[{"a":"metadata.agreementEnddate","c":"eq","v":null}],[{"a":"metadata.agreementEnddate","c":"gt","v":"${now}"}]]}}&sort={"a":"date","s":"Z"}&sort={"a":"metadata.agreementStartdate","s":"Z"}`,
			headers: {
				'Cookie': `token=${apiKey}`,
				'Content-Type': 'application/json'
			}
		};

		try {
			logger.info('Getting Upsales agreements...');
			const activeAgreements = (await axios(options)).data.data;
			logger.info('Upsales agreements retrieved.');
			return activeAgreements && activeAgreements.length;
		} catch (err) {
			const errorToReport = errorsHelper.wrapError(errors.UPSALES_GET_AGREEMENT_ERROR, err);
			logger.error(errorToReport);
			throw errorToReport;
		}
	};

	const getOpenActivities = async ({ clientId, countOnly, getAppointments = true, getActivities = true }) => {
		const now = moment().format('YYYY-MM-DDTHH:mm:ss');

		const limit = `?limit=${countOnly ? 0 : 10}`;
		const clientQuery = `&q={"a":"client.id","c":"eq","v":${clientId}}`;
		const sortParam = '&sort={"a":"date","s":"Z"}';
		const activityQuery = '&q={"a":"isAppointment","c":"eq","v":false}&q={"a":"closeDate","c":"eq","v":null}';
		const appointmentQuery = `&q={"a":"isAppointment","c":"eq","v":true}&q={"a":"endDate","c":"gt","v":"${now}"}`;
		const getUrl = (entity, query) => {
			return `${apiPath}v2/search/activitylist/${entity}${limit}${query}${clientQuery}${sortParam}`;
		};

		const options = (entity, query) => ({
			method: 'GET',
			url: getUrl(entity, query),
			headers: {
				'Cookie': `token=${apiKey}`,
				'Content-Type': 'application/json'
			}
		});

		try {
			logger.info('Getting Upsales activities...');
			const [activities, appointments] = (await Promise.all([
				getActivities ? axios(options('activities', activityQuery)) : Promise.resolve({ data: { data: [] } }),
				getAppointments ? axios(options('appointments', appointmentQuery)) : Promise.resolve({ data: { data: [] } })
			])).map(response => countOnly ? response.data.metadata.total : response.data.data);
			logger.info('Upsales activities retrieved.');
			return { activities, appointments };
		} catch (err) {
			const errorToReport = errorsHelper.wrapError(errors.UPSALES_GET_ACTIVITIES_ERROR, err);
			logger.error(errorToReport);
			throw errorToReport;
		}
	};

	return { getSales, getHasActiveAgreement, getOpenActivities };
};
