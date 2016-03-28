var express  = require('express');
var request  = require('request');
var validUrl = require('valid-url');
var share    = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/track', function(req, res)
{
    res.render('track.j2',
    {
        'url'      : share.track_url,
        'interval' : share.track_interval,
        'active'   : share.track_active
    });
});

router.post('/track/edit', function(req, res)
{
    var url      = req.body.url;
    var interval = parseInt(req.body.interval);

    if (validUrl.isHttpUri(url) && interval >= 1 && interval <= 99999)
    {
        share.track_url      = url;
        share.track_interval = interval;

        share.log('track IP-urless edited : ' + url);
        share.log('track visit interval edited : ' + interval);
    }

    res.redirect('/track');
});

router.get('/track/active', function(req, res)
{
    res.json(share.track_active);
});


/*========== communication with track ==========*/

var flag = false;

function track()
{
    if (!flag)
    {
        flag = true;

        for (server in share.servers)
        {

        }

        request(
        {
            'url'    : share.track_url,
            'method' : 'POST',
            'body'   : share.cache_list(),
            'json'   : true
        },
        function (error, response, body)
        {
            if (!error && response.statusCode == 200)
            {
                share.track_active = true;
                share.proxies      = body.proxies;
                share.servers      = body.servers;
            }
            else
            {
                share.track_active = false;
            }
            //share.log('track connection status : ' + share.track_active.toString());
            flag = false;
        });
    }

    setTimeout(track, share.track_interval);
};

track();