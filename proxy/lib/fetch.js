var express = require('express');
var path    = require('path');
var request = require('request');
var url     = require('url');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/fetch', function(req, res)
{
    var list = {};

    for (file in share.fetches)
    {
        list[decodeURIComponent(file)] = share.fetches[file];
    }

    res.render('fetch.j2',
    {
        'list' : list
    });
});

router.get('/fetch/clear', function(req, res)
{
    share.fetches = {};
    res.redirect('/fetch');
});

router.get('/fetch/:file', function(req, res)
{
    // http://10.1.1.1/kantai-1.jpg
    var file = url.parse(req.params.file);
    // http%3A%2F%2F10.1.1.1%2Fkantai-1.jpg
    var cache = encodeURIComponent(file.href);

    // local cache
    for (c of share.caches())
    {
        if (c == cache)
        {
            share.fetch_times_inc(cache);
            share.log('client [' + req.ip + '] get [' + file.href + '] from cache');
            res.sendFile(path.join(share.cache_path, cache));
            return;
        }
    }

    // other proxies' cache
    for (proxy in share.proxies)
    {
        for (c in share.proxies[proxy].cache)
        {
            if (c == cache)
            {   
                request(
                {
                    'url'      : 'http://' + proxy + ':12347/fetch/' + cache,
                    'encoding' : null,
                    'timeout'  : 1000
                },
                function(error, response, body)
                {
                    if (!error && response.statusCode == 200)
                    {
                        res.send(body);
                    }
                    else
                    {
                        share.log(error);
                    }
                });

                return;
            }
        }
    }

    // compare ping
    var server = file.host;
    var proxy  = '127.0.0.1';
    var min    = 2147483647;

    for (p in share.proxies)
    {
        var time = share.proxies[p].delay[server];

        if (time < min)
        {
            proxy = p;
            min   = time;
        }
    }

    // fetch from this proxy
    var fetch_url;

    if (proxy == '127.0.0.1')
    {
        fetch_url = file.href;

    }
    else
    {
        fetch_url = 'http://' + proxy + ':12347/fetch/' + cache;

    }

    if ()
    {
        request(
        {
            'url'      :  ? file.href : 
            'encoding' : null,
            'timeout'  : 1000
        },
        function(error, response, body)
        {
            if (!error && response.statusCode == 200)
            {
                share.fetch_times_inc(cache, 1);
                share.log('client [' + req.ip + '] get [' + req.params.file + '] from server');
                res.send(body);

                share.cache_save(encodeURIComponent(file.href), body, function(err)
                {
                    if (err)
                    {
                        share.log(err);
                    }
                    else
                    {
                        share.log('file cached : ' + file.href);
                    }
                });
            }
            else
            {
                share.log(error || response.statusMessage);
                share.log('failed to fetch file directly : ' + file.href);
            }
        });
    }
});