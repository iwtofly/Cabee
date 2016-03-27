var express = require('express');
var ipaddr  = require('ipaddr.js');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/track', function(req, res)
{
    res.render('track.j2',
    {
        'addr'     : share.track_ip,
        'interval' : share.track_interval,
        'active'   : share.track_active
    });
});

router.post('/track/edit', function(req, res)
{
    var addr     = req.body.addr;
    var interval = parseInt(req.body.interval);

    if (ipaddr.IPv4.isValid(addr) && interval >= 1 && interval <= 99999)
    {
        share.track_ip       = addr;
        share.track_interval = interval;

        share.log('track IP-address edited : ' + addr);
        share.log('track visit interval edited : ' + interval);
    }

    res.redirect('/track');
});

function track()
{
    console.log('shit');
    setTimeout(track, share.track_interval);
};

track();