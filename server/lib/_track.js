var express  = require('express');
var request  = require('request');
var _        = require('./_.js');

var router = module.exports = express.Router();

router.get('/', function(req, res)
{
    res.render('track.j2',
    {
        'track' : _.track
    });
});

router.post('/edit', function(req, res)
{
    _.track.url      = req.body.url;
    _.track.interval = req.body.interval;

    res.redirect('/track');
});

router.get('/active', function(req, res)
{
    res.json(_.track.active);
});

_.track.auto = true;
_.track.check();