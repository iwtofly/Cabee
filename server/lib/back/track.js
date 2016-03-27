var express = require('express');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/track', function(req, res)
{
    res.render('track.j2', {'ip' : share.track_ip});
})

router.post('/track/edit', function(req, res)
{
    if (req.body['ip'])
    {
        share.track_ip = req.body['ip'];
        share.log('track-host IP edited : ' + req.body['ip']);
    }

    res.redirect('/track');
});