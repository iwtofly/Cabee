var express = require('express');
var ipaddr  = require('ipaddr.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', function(req, res)
{
    res.render('proxy.j2',
    {
        'proxies' : _.proxies
    });
});

router.get('/clear', function(req, res)
{
    _.proxies = {};
    res.redirect('/proxy');
});

router.post('/check', function(req, res)
{
    var addr = ipaddr.process(req.ip);

    _.proxies[addr] = req.body;
    
    res.json(
    {
        'proxies' : _.proxies,
        'servers' : _.servers
    });
});