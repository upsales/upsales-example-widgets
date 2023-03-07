const router = require('express').Router();
const Components = require('../helpers/components');
const Click = require('../helpers/click');

const getCustomField = (customField, order) => {
	const numberTypes = ['Integer', 'Percent', 'Currency', 'Discount']

	let value = 'New value';
	let defaultValue = '';

	if (numberTypes.includes(customField.datatype)) {
		value = 3333;
	} else if (customField.datatype === 'Date') {
		value = '2022-02-22';
	} else if (customField.datatype === 'Select') {
		defaultValue = ['1', '2', '3'];
		value = '2';
	} else if (customField.datatype === 'User') {
		value = order.user.id;
	}

	return {
		...customField,
		value,
		default: defaultValue,
	}
}


router.post('/newOpportunity', (req, res) => {
	const { body } = req;

	const order = (body && body.data && body.data.object) || {};

	const newOrderOverrides = {
		client: { id: 4267 },
		contact: { id: 2281 },
		description: 'New opportunity',
		date: '2021-01-01',
		stage: { id: 9 },
		clientConnection: order.clientConnection,
		project: order.project,
		recurringInterval: 3,
		marketingContribution: 1,
		salesCoach: order.salesCoach,
		notes: `New opportunity from ${order.id}`,
		currency: 'USD',
		orderRow: order.orderRow.map(row => {
			const { id, custom, ...rest} = row;

			return {
				...rest,
				price: 100,
				listPrice: 120,
				quantity: 10,
				purchaseCost: 10,
				custom: custom.map(cf => getCustomField(cf, order))
			};
		}),
		custom: order.custom.map(cf => getCustomField(cf, order))
	}

	const rows = [
		Components.Button({
			text: 'New opportunity',
			fullWidth: true,
			click: Click.Create({
				entity: 'opportunity',
				options: newOrderOverrides
			})
		}),
		Components.EmptyRow(),
		Components.Button({
			text: 'Copy this one',
			fullWidth: true,
			click: Click.Create({
				entity: 'opportunity',
				options: {
					id: order.id,
					...newOrderOverrides
				}
			})
		})
	];

	return res.send({ rows });
});

module.exports = router;

