var express = require('express');
var fs      = require('fs');
var path    = require('path');
var cache   = require('./cache.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', (req, res) =>
{
    res.render('cache.j2',
    {
        'caches' : cache.listSync(_.filePath)
    });
});

router.get('/delete/:file', (req, res) =>
{
    (new cache(req.params.file, _.filePath).deleteSync());
    res.redirect('/cache');
});

router.get('/clear', (req, res) =>
{
    cache.clearSync(_.filePath);
    res.redirect('/cache');
});