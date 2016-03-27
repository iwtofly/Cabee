var express = require('express');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/proxy', function(req, res)
{
    res.render('proxy.j2', {'list' : share.proxy_list});
});

router.post('/proxy/report', function(req, res)
{
    share.proxy_list[req.ip] = JSON.parse(req.body);
    res.redirect('/proxy/list');
});

router.get('/proxy/list', function(req, res)
{
    res.json(share.proxy_list);
});

router.get('/proxy/clear', function(req, res)
{
    share.proxy_list = {};
    res.redirect('/proxy');
});