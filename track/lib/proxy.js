var express = require('express');
var ipaddr  = require('ipaddr.js');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/proxy', function(req, res)
{
    res.render('proxy.j2', {'list' : share.proxies});
});

router.get('/proxy/delay/all', function(req, res)
{
    res.json(share.proxy_delay());
});

router.get('/proxy/delay/:server', function(req, res)
{
    res.json(share.proxy_delay(req.params.server));
});

router.get('/proxy/cache/all', function(req, res)
{
    res.json(share.proxy_cache());
});

router.get('/proxy/cache/:server', function(req, res)
{
    res.json(share.proxy_cache(req.params.server));
});

router.get('/proxy/clear', function(req, res)
{
    share.proxies = {};
    res.redirect('/proxy');
});

router.post('/proxy/check', function(req, res)
{
    var addr = ipaddr.process(req.ip);

    share.proxies[addr] = req.body;
    //share.log('server report received from : ' + addr);
    
    res.json(
    {
        'proxies' : share.proxies,
        'servers' : share.servers
    });
});