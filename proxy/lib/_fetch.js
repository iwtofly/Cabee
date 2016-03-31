var express = require('express');
var path    = require('path');
var request = require('request');
var url     = require('url');
var cache   = require('./cache.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/:file', function(req, res)
{
    var c = new cache(req.params.file, _.cachePath);

    // search local cache  :D
    if (c.exist())
    {
        console.log('client [' + req.ip + '] get [' + file.href + '] from cache');
        c.hit();
        res.sendFile(c.path);
        return;
    }

    // search other proxies' cache  :|
    for (p of _.proxies)
    {
        if (p.hasCache(c.name))
        {
            p.fetch(c.name, _.fetchTimeout, (error, response, body) =>
            {
                if (!error && response.statusCode == 200)
                {
                    c.save(body);
                    console.log('client [' + req.ip + '] get [' + file.href + '] from proxy [' + p.ip + ']');
                    res.sendFile(c.path);
                }
                else
                {
                    res.status(404).end();
                }
            });
            return;
        }
    }

    // get by myself  :(
    request(
    {
        'url'      : c.url
        'encoding' : null,
        'timeout'  : _.fetchTimeout
    },
    (error, response, body) =>
    {
        if (!error && response.statusCode == 200)
        {
            c.save(body);
            console.log('client [' + req.ip + '] get [' + file.href + '] from server');
            res.sendFile(c.path);
        }
        else
        {
            res.status(404).end();
        }
    });
});