var express = require('express');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', function(req, res)
{
    res.render('pull.j2',
    {
        'servers' : _.servers
    });
});