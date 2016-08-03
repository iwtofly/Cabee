var router = module.exports = require('express').Router();

var proxies = require('./_.js').proxies;

router.get('/', (req, res) =>
{
    res.json(proxies);
});