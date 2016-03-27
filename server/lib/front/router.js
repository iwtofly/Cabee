var express = require('express');
var fs      = require('fs');
var path    = require('path');
var ipaddr  = require('ipaddr.js');
var share   = require('../back/share');

var router  = express.Router();
module.exports = router;

router.get('/', function(req, res)
{
    res.render('front.j2', {'files' : share.upload_list()});
});

router.get(/.+\.(jpg|mp4)$/, function(req, res)
{
    var file = path.resolve(share.upload_path + req.url);

    if (fs.existsSync(file))
    {
        var time = share.delay_time(req.ip);   

        setTimeout(function()
        {
            share.log('client [' + req.ip + '] get [' + file + '] in ' + time + ' ms');
            res.sendFile(file);
        },
        time);
    }
    else
    {
        share.log('file not found: ' + file);
        res.status(404).end();
    }
});

router.get('/ping', function(req, res)
{
    res.json(share.delay_time(req.params.addr));
});