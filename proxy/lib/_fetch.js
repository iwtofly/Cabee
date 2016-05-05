var express = require('express');
var path    = require('path');
var request = require('request');
var url     = require('url');
var cache   = require('./cache.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/:file', (req, res) =>
{
    var c = new cache(req.params.file, _.filePath);

    // local cache  :D
    if (c.existSync())
    {
        console.log('client [' + req.ip + '] get [' + c.url + '] from cache');
        c.hit();
        res.sendFile(c.path);
        return;
    }

    // other proxies' cache  :|
    for (proxy in _.proxies)
    {
        for (f in _.proxies[proxy])
        {
            if (f == c.href)
            {
                request(
                {
                    'url'      : 'http://' + proxy + '/fetch/' + encodeURIComponent(c.href),
                    'encoding' : null,
                    'timeout'  : _.fetchTimeout
                },
                (error, response, body) =>
                {
                    if (!error && response.statusCode == 200)
                    {
                        c.saveSync(body);
                        console.log('client [' + req.ip + '] get [' + c.url + '] from proxy [' + p.ip + ']');
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
    }

    // get by myself  :(
    c.pull(_.fetchTimeout, (err) =>
    {
        if (err)
        {
            console.log('client [' + req.ip + '] get [' + c.url + '] fail');
            res.status(404).end();
        }
        else
        {
            console.log('client [' + req.ip + '] get [' + c.url + '] from server');
            res.sendFile(c.path);
        }
    });
});