const router = require('express').Router();

router.post('/countries', async (req, res, next) => {
    res.json([
        { value: 'Sweden', name: 'Sweden' },
    ])
});

module.exports = router;
