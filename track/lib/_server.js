var express = require('express');
var ipaddr  = require('ipaddr.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', (req, res) =>
{
    res.render('server.j2',
    {
        'servers' : _.servers
    });
});

router.get('/clear', (req, res) =>
{
    _.servers = {};
    res.redirect('/server');
});

router.post('/check', (req, res) =>
{
    var addr = ipaddr.process(req.ip);

    _.servers[addr] = req.body;

    res.json(_.hits(addr));
});