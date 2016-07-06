var express  = require('express');

var router = module.exports = express.Router();

router.post('/', (req, res) =>
{
    for (key in req.body)
    {
        console.log(key + ' : ' + req.body[key]);
    }
    res.end('shit');
    // res.json({'1' : 123});
});