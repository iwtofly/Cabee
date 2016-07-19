var express = require('express');
var ipaddr  = require('ipaddr.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', (req, res) =>
{
    res.redirect('/proxy/p');
});

router.get('/p', (req, res) =>
{
    res.render('proxyP.j2',
    {
        'proxies' : _.proxies
    });
});

router.get('/s', (req, res) =>
{
    res.render('proxyS.j2',
    {
        'hits' : _.hits()
    });
});

router.get('/clear', (req, res) =>
{
    _.proxies = {};
    res.redirect('/proxy/p');
});

router.post('/check', (req, res) =>
{
    var addr = ipaddr.process(req.ip);

    _.proxies[addr] = req.body;
    
    res.json(
    {
        'proxies' : _.proxies,
        'servers' : _.servers
    });
});