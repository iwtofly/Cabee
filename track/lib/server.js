var express = require('express');
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
    share.server_list[req.ip] = JSON.parse(req.body);
    res.send('ok');
});

router.get('/server/clear', function(req, res)
{
    share.server_list = {};
    res.redirect('/server');
});