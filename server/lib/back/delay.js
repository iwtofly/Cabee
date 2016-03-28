var express = require('express');
var ipaddr  = require('ipaddr.js');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/delay', function(req, res)
{
    res.render('delay.j2', {'list' : share.delays});
});

router.post('/delay/edit', function(req, res)
{
    var addr = req.body.addr;
    var mask = req.body.mask;
    var time = req.body.time;

    var list = [];

    if (addr && !(addr instanceof Array))
    {
        addr = [addr];
        mask = [mask];
        time = [time];
    }

    for (var i = 0; i < addr.length; i++)
    {
        time[i] = parseInt(time[i]);

        if (ipaddr.IPv4.isValid(addr[i]) && ipaddr.IPv4.isValid(mask[i]) && time[i] >= 0 && time[i] <= 99999)
        {
            list.push(
            {
                'addr' : addr[i],
                'mask' : mask[i],
                'time' : time[i]
            });
        }
        else
        {
            share.log('invalid ip-delay info');
        }
    }

    share.delays = list;
    share.log('ip-delay edited : ' + JSON.stringify(list));

    res.redirect('/delay');
});

router.get('/delay/list', function(req, res)
{
    res.json(share.delays);
});