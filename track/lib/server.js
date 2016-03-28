var express = require('express');
var ipaddr  = require('ipaddr.js');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/server', function(req, res)
{
    res.render('server.j2', {'list' : share.servers});
});

router.get('/server/file/all', function(req, res)
{
    res.json(share.servers);
});

router.get('/server/file/:server', function(req, res)
{
    res.json(share.servers[req.params.server]);
});

router.get('/server/clear', function(req, res)
{
    share.servers = {};
    res.redirect('/server');
});

router.post('/server/check', function(req, res)
{
    var addr = ipaddr.process(req.ip);

    share.servers[addr] = req.body;
    //share.log('server check received from : ' + addr);
    
    res.json('ok');
});