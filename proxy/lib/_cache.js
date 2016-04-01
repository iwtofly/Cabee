var express = require('express');
var fs      = require('fs');
var path    = require('path');
var cache   = require('./cache.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', function(req, res)
{
    res.render('cache.j2',
    {
        'caches' : cache.list(_.cachePath)
    });
});

router.get('/delete/:file', function(req, res)
{
    (new cache(req.params.file, _.cachePath).delete());
    res.redirect('/cache');
});

router.get('/clear', function(req, res)
{
    cache.clear(_.cachePath);
    res.redirect('/cache');
});