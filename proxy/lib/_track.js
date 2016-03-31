var express  = require('express');
var request  = require('request');
var validUrl = require('valid-url');
var share    = require('./share.js');

var router = express.Router();
module.exports = router;

var url      = 'http://127.0.0.1:12346/proxy/check';
var interval = 1000;
var active   = false;


/*========== route ==========*/

router.get('/track', function(req, res)
{
    res.render('track.j2',
    {
        'url'      : url,
        'interval' : interval,
        'active'   : active
    });
});

router.post('/track/edit', function(req, res)
{
    if (validUrl.isHttpUri(req.body.url))
    {
        url = req.body.url;
        share.log('track IP-urless edited : ' + url);
    }
    if (req.body.interval >= 1 && req.body.interval <= 99999)
    {
        interval = req.body.interval;
        share.log('track visit interval edited : ' + interval);
    }

    res.redirect('/track');
});

router.get('/track/active', function(req, res)
{
    res.json(active);
});


/*========== communicate with track ==========*/

var flag = false;

function track()
{
    if (!flag)
    {
        flag = true;

        var caches  = share.caches();
        var fetches = share.fetches;
        var cache   = {};

        for (file of caches)
        {
            cache[decodeURIComponent(file)] = fetches[file];
        }

        request(
        {
            'url'    : url,
            'method' : 'POST',
            'body'   :
            {
                'delay' : share.delays,
                'cache' : cache
            },
            'json'   : true
        },
        function (error, response, body)
        {
            if (!error && response.statusCode == 200)
            {
                active        = true;
                share.proxies = body.proxies;
                share.servers = body.servers;
            }
            else
            {
                active = false;
            }
            //share.log('track connection status : ' + active.toString());
            flag = false;
        });
    }

    setTimeout(track, interval);
};

track();