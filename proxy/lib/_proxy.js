var express = require('express');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/proxy', function(req, res)
{
    res.render('proxy.j2', {'list' : share.proxies});
});

router.get('/proxy/clear', function(req, res)
{
    share.proxies = {};
    res.redirect('/proxy');
});