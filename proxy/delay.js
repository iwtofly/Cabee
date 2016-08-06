var async   = require('async');
var request = require('request');
var ipaddr  = require('ipaddr.js');
var _       = require('./_');

var router = module.exports = require('express').Router();

router.get('/', (req, res) =>
{
    res.json(_.delay.all());
});

router.get('/ping/:ip', (req, res) =>
{
    if (req.params.ip == undefined) res.end('holy shit');
    res.json(_.delay.match(req.params.ip));
});

router.get('/ping', (req, res) =>
{
    res.json(_.delay.match(req.ip));
});

router.get('/pings', (req, res) =>
{
    res.json(_.pings);
});

function ping()
{
    async.each(Object.keys(_.servers).concat(Object.keys(_.proxies)),
    (ip, callback) =>
    {
        request(
        {
            'url'     : 'http:\/\/' + ipaddr.process(ip) + '/ping',
            'timeout' : _.config.ping.timeout
        },
        (error, response, body) =>
        {
            if (!error && response.statusCode == 200)
            {
                _.pings[ip] = parseInt(body);
                callback();
            }
            else
            {
                callback('cannot ping ' + ip);
            }
        });
    },
    (err) =>
    {
        if (err) { console.log(err); }
        setTimeout(ping, _.config.ping.interval);
    });
};

ping();