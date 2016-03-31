var express = require('express');
var fs      = require('fs');
var path    = require('path');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/cache', function(req, res)
{
    var caches = share.caches();
    var list   = {};

    for (file of caches)
    {
        list[decodeURIComponent(file)] = encodeURIComponent(file);
    };

    res.render('cache.j2', {'list' : list});
});

router.get('/cache/delete/:file', function(req, res)
{
    share.cache_delete(req.params.file);
    res.redirect('/cache');
});

router.get('/cache/clear', function(req, res)
{
    for (file of share.caches())
    {
        share.cache_delete(file);
    }
    res.redirect('/cache');
});

router.get('/cache/json', function(req, res)
{
    res.json(share.cache_list());
});