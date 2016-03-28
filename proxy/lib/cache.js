var express = require('express');
var fs      = require('fs');
var path    = require('path');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/cache', function(req, res)
{
    res.render('cache.j2', {'files' : share.cache_list()});
});

router.get('/cache/delete/:file', function(req, res)
{
    share.cache_delete(req.params.file);
    res.redirect('/cache');
});

router.get('/cache/clear', function(req, res)
{
    for (file in share.cache_list())
    {
        share.cache_delete(file);
    }
    res.redirect('/cache');
});

router.get('/cache/list', function(req, res)
{
    res.json(share.cache_list());
});