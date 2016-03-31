var express = require('express');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/server', function(req, res)
{
    res.render('server.j2', {'list' : share.servers});
});

router.get('/server/clear', function(req, res)
{
    share.servers = {};
    res.redirect('/server');
});