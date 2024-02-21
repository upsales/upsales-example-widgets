const { BadRequest } = require('http-errors');

/*
	Example responses

		editResponse.visible = {
			order: {
				date: false,
				description: false,
				stage: false,
				probability: false,
				clientConnection: false,
				project: false,
				recurringInterval: false,
				selectedCurrency: false,
				salesCoach: false,
				marketingContribution: false,
				notes: false,
				orderRow: {
					product: false,
					price: false,
					quantity: false,
					discountPercent: false,
					discount: false,
					purchaseCost: false,
					custom: {
						40: true,
						41: false
					}
				},
				orderRow@301: { // Targeting id
					price: true,
					quantity: true,
					custom: {
						40: true,
						41: false
					}
				},
				orderRow#2: { // Targeting sortId
					price: true,
					quantity: true,
					custom: {
						40: true,
						41: false
					}
				},
				custom: {
					1: true,
					2: false
				}
			}
		};

		editResponse.disabled = {
			order: {
				date: true,
				description: true,
				stage: true,
				probability: true,
				clientConnection: true,
				project: true,
				recurringInterval: true,
				selectedCurrency: true,
				salescoach: true,
				marketingContribution: true,
				notes: true,
				orderRow: {
					product: true,
					price: true,
					quantity: true,
					discountPercent: true,
					discount: true,
					purchaseCost: false,
					custom: {
						40: false,
						41: true
					}
				},
				orderRow@301: { // Targeting id
					price: true,
					quantity: true,
					custom: {
						40: true,
						41: false
					}
				},
				orderRow#2: { // Targeting sortId
					price: true,
					quantity: true,
					custom: {
						40: true,
						41: false
					}
				},
				custom: {
					1: false,
					2: true
				}
			}
		}

		editResponse.updated = {
			order: {
				date: '2021-01-01',
				project: { id: 1 },
				orderRow: [
					{
						id: 2,
						price: 1000,
						custom: [
							{ id: 30, value: true },
							{ id: 31, value: '1', default: ['1', '2', '3'] },
						]
					},
					{
						price: 200,
						custom: [
							{ id: 30, value: true },
							{ id: 31, value: '1', default: ['1', '2', '3'] },
						],
						sortId: 2
					}
				],
				custom: [
					{ id: 6, value: 'text' },
					{ id: 7, value: '5', default: ['4', '5', '6'] },
				]
			}
		}
*/

const AVAILABLEACTIONS = {
	DISABLE: 'disable',
	HIDE: 'hide',
	SHOW: 'show',
	SET: 'set'
};

const numberFields = ['probability', 'marketingContribution', 'recurringInterval'];

const orderRowNumberFields = ['price', 'quantity', 'discount', 'purchaseCost'];

const getUpdatedCustomFields = (attr, id, value) => {
	const updatedFields = [];
	if (attr === 'value') {
		updatedFields.push({
			id: parseInt(id),
			value: isNaN(parseInt(value)) ? value : parseInt(value)
		});
	} else if (attr === 'options') {
		updatedFields.push({
			id: parseInt(id),
			default: value.split(',').map(option => option.trim())
		});
	}
	return updatedFields;
};

const getUpdatedOrderRowFields = (id, field, value, customAttr, ...customValues) => {
	const updatedOrderRows = [];

	if (field === 'custom') {
		const updatedField = {
			id: Number(id),
			custom: getUpdatedCustomFields(customAttr, value, customValues.join(' '))
		};
		updatedOrderRows.push(updatedField);
	} else {
		const updatedField = {
			id: Number(id),
			[field]: orderRowNumberFields.includes(field) ? Number(value) : value
		};
		updatedOrderRows.push(updatedField);
	}

	return updatedOrderRows;
};

const parseFields = (descriptionParts, value) => {
	const [entity, fieldName, subField, customField] = descriptionParts.slice(1);
	const fields = fieldName ? fieldName.split(',') : [];
	const subFields = subField ? subField.split(',') : [];
	const customFields = customField ? customField.split(',') : [];

	return {
		[entity]: fields.reduce((fieldMap, field) => {
			if (!subFields.length) {
				fieldMap[field.trim()] = value;
				return fieldMap;
			}

			fieldMap[field.trim()] = subFields.reduce((subFieldMap, sf) => {
				if (customFields.length) {
					subFieldMap[sf.trim()] = customFields.reduce((customFieldMap, cf) => {
						customFieldMap[cf.trim()] = value;
						return customFieldMap;
					}, {});
				} else {
					subFieldMap[sf.trim()] = value;
				}
				return subFieldMap;
			}, {});
			return fieldMap;
		}, {})
	};
};

module.exports = ({ body }) => {
	if(!body.data) {
		throw new BadRequest('Missing order');
	}

	const editResponse = {
		visible: {},
		disabled: {}
	};

	// changes is an experimental feature where we are determining what
	// fields have changed by comparing order and previousOrder
	const { order, previousOrder, changes } = body.data;

	const descriptionParts = order.description ? order.description.split(' ') : [];
	const action = descriptionParts[0] ? descriptionParts[0].toLowerCase() : '';

	const showHideActions = [AVAILABLEACTIONS.HIDE, AVAILABLEACTIONS.SHOW];

	if (action === AVAILABLEACTIONS.DISABLE) {
		const [entity, fieldName, subField, customField] = descriptionParts.slice(1);
		editResponse.disabled = {
			[entity]: {
				[fieldName] : customField
					? { [subField]: { [customField]: true } }
					: subField ? { [subField]: true  } : true
			}
		};
	} else if (showHideActions.includes(action)) {
		const fieldVisible = action === AVAILABLEACTIONS.SHOW ? true : false;
		editResponse.visible = parseFields(descriptionParts, fieldVisible);
	} else if (action === AVAILABLEACTIONS.SET) {
		const [entity, field, valueOrId, valueOrAttr, value = '', ...rest] = descriptionParts.slice(1);
		const updatedFields = { [entity]: {} };

		const formattedField = field ? field.toLowerCase() : '';

		if (formattedField === 'orderrow') {
			updatedFields[entity][field] = getUpdatedOrderRowFields(valueOrId, valueOrAttr, value, ...rest);
		}  else if (field === 'custom') {
			updatedFields[entity][field] = getUpdatedCustomFields(valueOrAttr, valueOrId, value);

		} else if (valueOrAttr) {
			if (!updatedFields[entity][field]) {
				updatedFields[entity][field] = {};
			}
			updatedFields[entity][field][valueOrId] = parseInt(valueOrAttr);
		} else {
			const isNumber = numberFields.includes(field);
			updatedFields[entity][field] = isNumber ? parseInt(valueOrId) : valueOrId;
		}
		editResponse.updated = updatedFields;
	}

	return editResponse;
};