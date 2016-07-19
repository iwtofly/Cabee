var express  = require('express');
var request  = require('request');
var _        = require('./_.js');

var router = module.exports = express.Router();

router.get('/', (req, res) =>
{
    res.render('track.j2',
    {
        'track' : _.track
    });
});

router.post('/edit', (req, res) =>
{
    _.track.url      = req.body.url;
    _.track.interval = req.body.interval;
    console.log('track edited by ' + req.ip);
    _.save();

    res.redirect('/track');
});

router.get('/active', (req, res) =>
{
    res.json(_.track.active);
});

_.track.check();