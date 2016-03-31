var express  = require('express');
var request  = require('request');
var share    = require('./share.js');

var router = express.Router();
module.exports = router;

var interval = 1000;


/*========== route ==========*/

router.get('/delay', function(req, res)
{
    res.render('delay.j2',
    {
        'list'     : share.delays,
        'interval' : interval
    });
});

router.post('/delay/edit', function(req, res)
{
    if (req.body.interval >= 1000 && req.body.interval <= 99999)
    {
        interval = req.body.interval;
        share.log('track visit interval edited : ' + interval);
    }

    res.redirect('/delay');
});


/*========== ping server ==========*/

var flag = false;

function ping()
{
    if (!flag)
    {
        var servers = Object.keys(share.servers);

        if (servers.length != 0)
        {
            flag = true;

            var delays = {};
            var cnt    = servers.length;

            for (var i = 0; i < servers.length; i++)
            {
                var j = i;

                request(
                {
                    'url'     : 'http://' + servers[j] + '/ping',                    
                    'timeout' : interval - 100
                },
                function (error, response, body)
                {
                    if (!error && response.statusCode == 200)
                    {
                        delays[servers[j]] = JSON.parse(body);
                    }
                    else
                    {
                        delays[servers[j]] = 'unreachable';
                    }
                    if (--cnt == 0)
                    {
                        flag = false;
                        share.delays = delays;
                    }
                });
            }
        }
    }

    setTimeout(ping, interval);
};

ping();