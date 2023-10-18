const { BadRequest } = require('http-errors');
const router = require('express').Router();

router.post('/validate/order', async (req, res) => {
    const contact = req.body.data.obj.contact;
    console.log(contact);
    if(contact == undefined){
        const badReq = new BadRequest('Kontaktperson är obligatorisk.');
        return res.status(badReq.status).send(badReq.message);
    }
    return res.sendStatus(200);
});
module.exports = router;