const router = require('express').Router();
const Components = require('../helpers/components');

router.post('/subscriptionWidget', (req, res) => {
    const description = req.body?.data?.object?.description || 'No description found';
    const rows = [
        Components.EmptyRow(),
        Components.Text({
            text: `Description:  ${description}`,
        }),
        Components.EmptyRow(),
    ];

    res.send({ rows });
});

module.exports = router;