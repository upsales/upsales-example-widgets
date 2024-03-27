const router = require('express').Router();
const Components = require('../helpers/components');
const Click = require('../helpers/click');

const getCustomField = (customField, currentPeriod) => {
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
		value = currentPeriod.user.id;
	}

	return {
		...customField,
		value,
		default: defaultValue,
	}
}

const getUpdatedCustomFields = (attr, id, value) => {
	const updatedFields = [];
	if (attr === 'value') {
		const isTime = value.includes(':');
		const isDate = value.includes('-');
		const isText = isNaN(parseInt(value)) || isDate || isTime;
		const isBoolean = value === 'true' || value === 'false';
		updatedFields.push({
			fieldId: parseInt(id),
			value: isText ? isBoolean ? value === 'true' : value : parseInt(value)
		});
	} else if (attr === 'options' && !!value.trim()) {
		updatedFields.push({
			fieldId: parseInt(id),
			default: value.split(',').map(option => option.trim())
		});
	} else if (attr === 'name') {
		updatedFields.push({
			fieldId: parseInt(id),
			name: value
		});
	} else if (attr === 'placeholder') {
		updatedFields.push({
			fieldId: parseInt(id),
			placeholder: value
		});
	}
	return updatedFields;
};

const setCustomField = (cf) => {
	// const dateIds = [34, 74];
	// const timeIds = [38, 78];
	// const booleanIds = [36, 76];
	// const selectIds = [40, 80];
	// const numberIds = [35, 37, 44, 75, 77, 84, 39, 79];
	// const userSelectIds = [45, 85];

    // ALPHA VALUES
	const dateIds = [31, 14];
	const timeIds = [35,18];
	const booleanIds = [33,16];
	const selectIds = [37,20];
	const numberIds = [32,34,36,41,15,17,19,24];
	const userSelectIds = [42,25]

	let value = 'Value set from app';
	if (dateIds.includes(cf.fieldId)) {
		value = '2024-03-02';
	} else if (timeIds.includes(cf.fieldId)) {
		value = '12:00';
	} else if (booleanIds.includes(cf.fieldId)) {
		value = 'true';
	} else if (selectIds.includes(cf.fieldId)) {
		value = '2'
	} else if (numberIds.includes(cf.fieldId)) {
		value = '3333';
	} else if (userSelectIds.includes(cf.fieldId)) {
		value = '9';
	}

	return getUpdatedCustomFields('value', cf.fieldId, value)[0];
}

router.post('/openModal', (req, res) => {
	const { body } = req;
	const subscription = (body && body.data && body.data.object) || {};

    const currentPeriod = subscription.subscriptionMap[subscription.currentUUID];

	const firstOrderRowId = currentPeriod?.orderRows?.[0]?.id;
	const firstOrderRowSortId = currentPeriod?.orderRows?.[0]?.sortId;

	const allCustomFields = currentPeriod?.orderRows?.[0]?.custom ?? [];

    const addedFieldActions = {
        added: {
            order: {
                orderRow: [
                    {
                        productId: 10000557,
                        bundleRows: [{
                            productId: 10000488,
                            quantity: 20,
                            price: 10,
                            product: {
                                purchaseCost: 10,
                            }
                        }],
                        discount: 2,
                        quantity: 3,
                        custom: allCustomFields.map(cf => getCustomField(cf, currentPeriod)).map(setCustomField),
                    },
					{
                        product: {
							id: 10000557
						},
                        bundleRows: [{
                            productId: 10000488,
                            quantity: 20,
                            price: 10,
                            product: {
                                purchaseCost: 10,
                            }
                        }],
                        discount: 2,
                        quantity: 3,
                        custom: allCustomFields.map(cf => getCustomField(cf, currentPeriod)).map(setCustomField),
                    }
                ]
            }
        },
    };

    const updatedFieldActions = {
        updated: {
			order: {
				orderRow: [
					{
						id: firstOrderRowId,
						sortId: firstOrderRowSortId,
                        productId: 10000557,
                        bundleRows: [{
                            productId: 10000488,
                            quantity: 20,
                            price: 10,
                            product: {
                                purchaseCost: 10,
                            }
                        }],
                        discount: 2,
                        quantity: 3,
						// custom: allCustomFields.map(cf => getCustomField(cf, currentPeriod)).map(setCustomField),
						custom: [
							{ id: 13, value: 'Text value' },
							{ id: 14, value: '2022-02-22' }
						]
					},
				],
			}
        }
    };

	const html = `
            <style>
                button {
                    padding: 10px;
                    border: 1px solid #333;
                    border-radius: 4px;
                    background-color: white;
                    transition: opacity 0.2s;
                    cursor: pointer;
                    margin-right: 10px;
                }

                button:hover {
                    opacity: 0.8;
                }

                .row {
                    width: 100%;
                    display: flex;
                    margin-bottom: 20px;
                    align-items: center;
                }

                .column {
                    flex: 1 0 50%;
                }
            </style>

			<div>
                <div class="row">
                    <button onclick="addOrderRow()">Add order row</button>
                    <div id="orderRowAddedInfo"></div>
                </div>

                <div class="row">
                    <button onclick="updateOrderRow()">Update first order row</button>
                    <div id="orderRowUpdatedInfo"></div>
                </div>

				<script>
                    function addOrderRow() {
                        window.parent.postMessage(['updateOrderFromApp', ${JSON.stringify(addedFieldActions)}],'*');
                        document.querySelector('#orderRowAddedInfo').innerHTML = 'Order row added';
                    }

                    function updateOrderRow() {
                        window.parent.postMessage(['updateOrderFromApp', ${JSON.stringify(updatedFieldActions)}],'*');
                        document.querySelector('#orderRowUpdatedInfo').innerHTML = 'Order row updated';
                    }
				</script>
			</div>
	`

	const rows = [
		Components.Iframe({
			html,
			height: 300,
			width: 600,
		})
	];
	return res.send({ rows });
});

router.post('/subscriptionWidget', (req, res) => {
    const description = req.body?.data?.object?.description || 'No description found';
    const rows = [
        Components.EmptyRow(),
        Components.Text({
            text: `Description:  ${description}`,
        }),
        Components.Button({
			text: 'Open modal to modify subscription',
			fullWidth: true,
			click: Click.Modal({
				name: 'openModal',
				size: 'md'
			})
		}),
        Components.EmptyRow(),
    ];

    res.send({ rows });
});

module.exports = router;