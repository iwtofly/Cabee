var express = require('express');
var ipaddr  = require('ipaddr.js');
var delay   = require('./delay');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', (req, res) =>
{
    res.render('delay.j2',
    {
        'delays' : _.delays
    });
});

router.post('/edit', (req, res) =>
{
    var cidr = req.body.cidr;
    var time = req.body.time;

    if (cidr && !(cidr instanceof Array))
    {
        cidr = [cidr];
        time = [time];
    }

    var delays = [];

    for (var i = 0; i < cidr.length; i++)
    {
        var slash   = cidr[i].indexOf('/');
        var cidrIP  = cidr[i].substr(0, slash);
        var cidrLen = parseInt(cidr[i].substr(slash + 1));

        if ((ipaddr.IPv4.isValid(cidrIP) && cidrLen >= 0 && cidrLen <= 32) ||
            (ipaddr.IPv6.isValid(cidrIP) && cidrLen >= 0 && cidrLen <= 128))
        {
            delays.push(new delay(cidrIP + '/' + cidrLen, parseInt(time[i])));
        }
    }

    _.delays = delays;
    console.log('ip-delay edited by ' + req.ip);
    _.save();

    res.redirect('/delay');
});