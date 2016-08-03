var router = module.exports = require('express').Router();

var delay = require('./_.js').delay;

router.get('/', (req, res) =>
{
    res.json(delay.all());
});

router.get('/ping/:ip', (req, res) =>
{
    if (req.params.ip == undefined) res.end('holy shit');
    res.json(delay.match(req.params.ip));
});

router.get('/ping', (req, res) =>
{
    res.json(delay.match(req.ip));
});