var express  = require('express');
var request  = require('request');
var share    = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/delay', function(req, res)
{
    res.render('delay.j2',
    {
        'list'     : share.delays,
        'interval' : share.delay_interval
    });
});

router.post('/delay/edit', function(req, res)
{
    var interval = parseInt(req.body.interval);

    if (interval >= 1 && interval <= 99999)
    {
        share.delay_interval = interval;
        share.log('server ping interval edited : ' + interval);
    }

    res.redirect('/delay');
});


/*========== ping server ==========*/

var flag = false;

function ping()
{
    if (!flag)
    {
        flag = true;

        var servers = Object.keys(share.servers);

        for (var i = 0; i < servers.length; i++)
        {        
            var j = i;

            request('http://' + servers[i] + '/ping', function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    share.delays[servers[i]] = JSON.parse(body);
                }
                if (j == servers.length - 1)
                {
                    flag = false;
                }
            });
        }
    }

    setTimeout(ping, share.delay_interval);
};

ping();