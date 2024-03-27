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
				totalGross: false,
				totalDiscount: false,
				totalContributionMargin: false,
				totalRR: false,
				totalOneOff: false,
				totalNet: false,
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

		editResponse.added = {
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

		editResponse.removed = {
			order: {
				orderRow: [
					{ id: 2 },
					{ sortId: 2 },
					{ uuid: 1710162661567 }
				]
			}
		}
*/

const AVAILABLEACTIONS = {
	DISABLE: 'disable',
	ENABLE: 'enable',
	HIDE: 'hide',
	SHOW: 'show',
	SET: 'set',
	ADD: 'add',
	REMOVE: 'remove',
	WAIT: 'wait'
};

const numberFields = ['probability', 'marketingContribution', 'recurringInterval'];

const orderRowNumberFields = ['price', 'quantity', 'discount', 'purchaseCost', 'discountPercent', 'productId', 'tierQuantity'];

const getUpdatedCustomFields = (attr, id, value) => {
	const updatedFields = [];
	if (attr === 'value') {
		const isTime = value.includes(':');
		const isDate = value.includes('-');
		const isText = isNaN(parseInt(value)) || isDate || isTime;
		const isBoolean = value === 'true' || value === 'false';
		updatedFields.push({
			id: parseInt(id),
			value: isText ? isBoolean ? value === 'true' : value : parseInt(value)
		});
	} else if (attr === 'options' && !!value.trim()) {
		updatedFields.push({
			id: parseInt(id),
			default: value.split(',').map(option => option.trim())
		});
	} else if (attr === 'name') {
		updatedFields.push({
			id: parseInt(id),
			name: value
		});
	} else if (attr === 'placeholder') {
		updatedFields.push({
			id: parseInt(id),
			placeholder: value
		});
	}
	return updatedFields;
};

const groupFieldsOnType = (allFields) => {
	let isStandardField = true;
	return allFields.reduce((acc, field, index) => {
		if (field === 'custom') {
			isStandardField = false;
		} else if (isStandardField) {
			acc.standardFields.push(field);
		} else {
			acc.customFields.push(field);
		}
		return acc;
	}, { standardFields: [], customFields: [] });
};

const handleBundleRow = (attributes) => {
	const [id, bundleField, ...values] = attributes;
	const productId = Number(id);
	let bundleValue = values.join(' ');
	const valueIsNumber = orderRowNumberFields.includes(bundleField);
	bundleValue = valueIsNumber ? Number(bundleValue) : bundleValue

	const bundleRow = { productId };

	if (bundleField === 'price') {
		bundleRow.product = {
			id: productId,
			currencies: [{
				currency: 'SEK',
				price: bundleValue
			}],
			listPrice: bundleValue
		}
	} else {
		bundleRow[bundleField] = bundleValue;
	}
	return bundleRow;
};

const convertArrayToKeyValue = (attributes) => {
	let bundleRowProductId;
	return attributes.reduce((acc, attr, index) => {
		if (index % 2 !== 0) {
			const field = attributes[index - 1];

			if (field === 'bundleRow' || bundleRowProductId) {
				if (!bundleRowProductId) {
					bundleRowProductId = Number(attr);
					return acc;
				} else {
					const bundleRow = handleBundleRow([bundleRowProductId, field, attr]);
					console.log('bundleRow', bundleRow);
					console.log('acc.bundleRows[0]', acc.bundleRows?.[0])
					if (acc.bundleRows) {
						acc.bundleRows[0] = {...acc.bundleRows[0], ...bundleRow};
					} else {
						acc.bundleRows = [bundleRow];
					}
					return acc;
				}
			}

			acc[field] = orderRowNumberFields.includes(field) ? Number(attr) : attr;
		}
		console.log('acc', acc)
		return acc;
	}, {});
};

const convertArrayToCustomFields = (attributes) => {
	return attributes.reduce((acc, attr, index) => {
		if (index % 2 !== 0) {
			const field = attributes[index - 1];
			const customField = { fieldId: field, value: attr };
			acc.push(customField);
		}
		return acc;
	}, []);
};

const getAddedOrderRowFields = (allFields) => {
	const { standardFields, customFields } = groupFieldsOnType(allFields);
	const orderRow = {
		...convertArrayToKeyValue(standardFields),
		custom: convertArrayToCustomFields(customFields)
	};
	return [orderRow];
};

const getUpdatedOrderRowFields = (id, field, value, customAttr, ...customValues) => {
	const updatedOrderRows = [];

	const isSortId = id.startsWith('#');

	if (field === 'custom') {
		const updatedField = {
			id: isSortId ? undefined : Number(id),
			custom: getUpdatedCustomFields(customAttr, value, customValues.join(' ')),
			sortId: isSortId ? Number(id.slice(1)) : undefined
		};
		updatedOrderRows.push(updatedField);
	} else if (field === 'bundleRow') {
		const bundleRow = handleBundleRow([value, customAttr, ...customValues]);

		const updatedField = {
			id: isSortId ? undefined : Number(id),
			bundleRows: [bundleRow],
			[field]: orderRowNumberFields.includes(field) ? Number(value) : value,
			sortId: isSortId ? Number(id.slice(1)) : undefined
		}
		updatedOrderRows.push(updatedField);
	} else {
		const updatedField = {
			id: isSortId ? undefined : Number(id),
			[field]: orderRowNumberFields.includes(field) ? Number(value) : value,
			sortId: isSortId ? Number(id.slice(1)) : undefined
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

module.exports = async ({ body }) => {
	if(!body.data?.current) {
		throw new BadRequest('Missing order');
	}

	const editResponse = {
		visible: {},
		disabled: {}
	};

	const actionCustomFieldId = 88;
	const alternativeCustomFieldId = 47;

	const actionCommand = body.data.current?.custom?.find(cf => [actionCustomFieldId, alternativeCustomFieldId].includes(cf.fieldId))?.value;
	if (!actionCommand) {
		return editResponse;
	}

	let splittedCommands = actionCommand.split(' ').map(com => (com || ''));
	const [rawAction] = splittedCommands;
	const action = rawAction.toLowerCase();

	const showHideActions = [AVAILABLEACTIONS.HIDE, AVAILABLEACTIONS.SHOW];
	const disableEnableActions = [AVAILABLEACTIONS.DISABLE, AVAILABLEACTIONS.ENABLE];

	if ([...showHideActions, ...disableEnableActions].includes(action)) {
		splittedCommands = splittedCommands.map(com => com.toLowerCase());
	}

	if (disableEnableActions.includes(action)) {
		const isDisabled = action === AVAILABLEACTIONS.DISABLE;
		const fieldDisabled = isDisabled ? true : false;
		editResponse.disabled = parseFields(splittedCommands, fieldDisabled);
	} else if (showHideActions.includes(action)) {
		const isShow = action === AVAILABLEACTIONS.SHOW;
		const fieldVisible = isShow ? true : false;
		editResponse.visible = parseFields(splittedCommands, fieldVisible);

		if (isShow) {
			editResponse.disabled = parseFields(splittedCommands, false);
		}
	} else if (action === AVAILABLEACTIONS.SET) {
		const [entity, field, valueOrId, valueOrAttr, value = '', ...rest] = splittedCommands.slice(1);
		const updatedFields = { [entity]: {} };

		const formattedField = field ? field.toLowerCase() : '';

		if (formattedField === 'orderrow') {
			updatedFields[entity][field] = getUpdatedOrderRowFields(valueOrId, valueOrAttr, value, ...rest);
		}  else if (field === 'custom') {
			updatedFields[entity][field] = getUpdatedCustomFields(valueOrAttr, valueOrId, [value, ...rest].join(' '));

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
	} else if (action === AVAILABLEACTIONS.ADD) {
		const [entity, field, ...rest] = splittedCommands.slice(1);
		editResponse.added = { [entity]: {
			[field]: getAddedOrderRowFields(rest)
		}};
	} else if (action === AVAILABLEACTIONS.REMOVE) {
		let [entity, field, key, value] = splittedCommands.slice(1);
		// UUID is changed regurlarly, so we will always target the first orderrow here
		if (key === 'uuid') {
			value = body.data.current?.orderRow?.[0]?.uuid;
		}
		editResponse.removed = { [entity]: {
			[field]: [{ [key]: Number(value) }]
		}};
	} else if (action === AVAILABLEACTIONS.WAIT) {
		const wait = parseInt(splittedCommands[1]);
		await new Promise(resolve => setTimeout(resolve, wait));
	}

	return editResponse;
};