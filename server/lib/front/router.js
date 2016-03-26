var express = require('express');
var fs      = require('fs');
var path    = require('path');
var router  = express.Router();

module.exports = router;

router.get('/', function(req, res)
{
    res.render('front.j2');
});

router.get(/^\/upload\/.+\.(jpg|mp4)$/, function(req, res)
{
    var file = path.resolve(__dirname + '/../..' + req.url);

    if (fs.existsSync(file))
    {
        res.sendFile(file);
    }
    else
    {
        res.status(404).end();
    }
});