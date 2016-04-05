var express = require('express');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', (req, res) =>
{
    res.render('proxy.j2',
    {
        'proxies' : _.proxies
    });
});

router.get('/clear', (req, res) =>
{
    _.proxies = {};
    res.redirect('/proxy');
});