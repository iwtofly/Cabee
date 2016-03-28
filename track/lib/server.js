var express = require('express');
var ipaddr  = require('ipaddr.js');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/server', function(req, res)
{
    res.render('server.j2', {'list' : share.server_list});
});

router.get('/server/list', function(req, res)
{
    res.json(share.server_list);
});

router.post('/server/report', function(req, res)
{
    var addr = ipaddr.process(req.ip);

    share.server_list[addr] = req.body;
    share.log('server report received from : ' + addr);
    
    res.json('ok');
});

router.get('/server/clear', function(req, res)
{
    share.server_list = {};
    res.redirect('/server');
});