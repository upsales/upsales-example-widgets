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

router.post('/openModal', (req, res) => {
	const { body } = req;
	const order = (body && body.data && body.data.object) || {};

	const fieldActions = {
		updated: {
			order: {
				orderRow: order.orderRow.map(row => ({
					...row,
					custom: [{
						id: 13,
						value: 99
					}]
				}))
			}
		}
	}

	const html = `
			<div>
				<h1>Modal content</h1>

				<script>
				function init() {
					(() => {

						setTimeout(() => {
							window.parent.postMessage(['updateOrderFromApp', ${JSON.stringify(fieldActions)}, ${JSON.stringify(order)}],'*');
						}, 100);
					})()
				}

					window.onload = init;
				</script>
			</div>
	`

	const rows = [
		Components.Iframe({
			html,
			height: 300,
			width: 300,
		})
	];
	return res.send({ rows });
});

const copyOrder = (order, extra = {}) => {
	const price = 100;
	const listPrice = 120;
	const purchaseCost = 10;

	const newOrderOverrides = {
		client: { id: 4267 },
		contact: { id: 2281 },
		description: 'New opportunity',
		date: '2021-01-01',
		closeDate: '2023-01-01',
		competitorId: 5,
		lostReason: 'price',
		stage: { id: 9 },
		clientConnection: order.clientConnection,
		project: order.project,
		recurringInterval: 3,
		marketingContribution: 1,
		salesCoach: order.salesCoach,
		notes: `New opportunity from ${order.id}`,
		currency: order.currency,
		orderRow: order.orderRow,
		orderRow: order.orderRow.map(row => {
			const { id, custom, ...rest} = row;

			const orderRow = {
				...rest,
				price,
				listPrice,
				quantity: 10,
				purchaseCost,
				value: price,
				custom: custom.map(cf => getCustomField(cf, order))
			};

			if (orderRow.bundleRows) {
				orderRow.bundleRows = orderRow.bundleRows.map(bundleRow => ({
					...bundleRow,
					price: price / orderRow.bundleRows.length,
					listPrice: listPrice / orderRow.bundleRows.length,
					purchaseCost: purchaseCost / orderRow.bundleRows.length,
					orderRowTotal: price / orderRow.bundleRows.length,
					product: {
						...row.product,
						price: price / orderRow.bundleRows.length,
						purchaseCost: purchaseCost / orderRow.bundleRows.length,
						listPrice: listPrice / orderRow.bundleRows.length,
						currencies: row.product.currencies.map(currency => ({
							...currency,
							price: price / orderRow.bundleRows.length,
							purchaseCost: purchaseCost / orderRow.bundleRows.length,
						})),
					},
					tierQuantity: 1,
				}));
			}

			return orderRow;
		}),
		custom: order.custom.map(cf => getCustomField(cf, order)),
		...extra
	}
	return newOrderOverrides;
}

router.post('/newOpportunity', (req, res) => {
	const { body } = req;

	const order = (body && body.data && body.data.object) || {};

	const newOpportunity = copyOrder(order, { stage: { id: 19 }});

	const rows = [
		Components.Button({
			text: 'Copy',
			fullWidth: true,
			click: Click.Create({
				entity: 'opportunity',
				options: {
					...newOpportunity
				}
			})
		}),
		Components.EmptyRow(),
		Components.Button({
			text: 'Open modal and set values',
			fullWidth: true,
			click: Click.Modal({
				name: 'openModal',
			})
		})
	];

	return res.send({ rows });
});

module.exports = router;

