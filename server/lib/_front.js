var express = require('express');
var fs      = require('fs');
var path    = require('path');
var ipaddr  = require('ipaddr.js');
var file    = require('./file.js');
var delay   = require('./delay.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', function(req, res)
{
    res.render('front.j2',
    {
        'files' : file.list(_.mediaPath)
    });
});

router.get(/.+\.(jpg|mp4)$/, function(req, res)
{
    var f = new file(req.url, _.mediaPath);

    if (f.exist())
    {
        var time = delay.match(req.ip, _.delays);

        setTimeout(function()
        {
            console.log('client [' + req.ip + '] get [' + f.name + '] in ' + time + ' ms');
            res.sendFile(f.path);
        },
        time);
    }
    else
    {
        console.log('file not found: ' + f.path);
        res.status(404).end();
    }
});

router.get('/ping', function(req, res)
{
    res.json(delay.match(req.ip, _.delays));
});