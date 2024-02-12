const router = require('express').Router();

router.post('/typeahead', async (req, res, next) => {
    res.sendStatus(400);

    // const data = [{
    //     id: 1,
    //     name: 'External data company'
    // }];
    // res.json({
    //     data,
    //     metadata: { total: data.length }
    // });
});

module.exports = router;
