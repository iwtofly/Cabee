var router = module.exports = require('express').Router();

var servers = require('./_.js').servers;

router.get('/', (req, res) =>
{
    res.json(servers);
});