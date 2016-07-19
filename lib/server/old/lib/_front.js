var express = require('express');
var fs      = require('fs');
var path    = require('path');
var ipaddr  = require('ipaddr.js');
var file    = require('./file.js');
var delay   = require('./delay.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', (req, res) =>
{
    var files = file.listSync(_.filePath);

    for (f of files)
    {
        f.hits = _.hits[f.href];
    }

    res.render('front.j2',
    {
        'files' : files
    });
});

router.get(/.+\.(jpg|mp4)$/, (req, res) =>
{
    var f = new file(req.url, _.filePath);

    if (f.existSync())
    {
        var time = delay.match(req.ip, _.delays);

        setTimeout(function()
        {
            console.log('client [' + req.ip + '] get [' + f.name + '] in ' + time + ' ms');
            f.cnt();
            res.sendFile(f.pathAbs);
        },
        time);
    }
    else
    {
        res.status(404).end();
    }
});

router.get('/ping', (req, res) =>
{
    res.json(delay.match(req.ip, _.delays));
});