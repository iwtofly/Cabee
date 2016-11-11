let express = require('express');
let util    = require('util');
let Ip      = require('_/ip');
let File    = require('_/file');
let Cache   = require('_/cache');

let mod = module.exports = function(app)
{
    this.app = app;
    this.router = express.Router();
    this.list = {};

    this.init();
};

mod.prototype.hit = function(cache)
{
    this.list[cache.ip] = this.list[cache.ip] || {};
    this.list[cache.ip][cache.port] = this.list[cache.ip][cache.port] || {};
    this.list[cache.ip][cache.port][cache.video] = this.list[cache.ip][cache.port][cache.video] || {};
    this.list[cache.ip][cache.port][cache.video][cache.piece] = this.list[cache.ip][cache.port][cache.video][cache.piece] || {'hit':0,'req':0};
    this.list[cache.ip][cache.port][cache.video][cache.piece].hit += 1;
};

mod.prototype.req = function(cache)
{
    this.list[cache.ip] = this.list[cache.ip] || {};
    this.list[cache.ip][cache.port] = this.list[cache.ip][cache.port] || {};
    this.list[cache.ip][cache.port][cache.video] = this.list[cache.ip][cache.port][cache.video] || {};
    this.list[cache.ip][cache.port][cache.video][cache.piece] = this.list[cache.ip][cache.port][cache.video][cache.piece] || {'hit':0,'req':0};
    this.list[cache.ip][cache.port][cache.video][cache.piece].req += 1;
};

mod.prototype.init = function()
{
    let app    = this.app;
    let dir    = app.dir;
    let router = this.router;

    router.get('/', (req, res) =>
    {
        res.render('count.j2', {'list' : this.list});
    });

    router.get('/delete', (req, res) =>
    {
        this.list = {};
        res.json('ok');
    });

    router.get('/delete/:ip', (req, res) =>
    {
        delete this.list[req.params.ip];
        res.json('ok');
    });

    router.get('/delete/:ip/:port', (req, res) =>
    {
        delete this.list[req.params.ip][req.params.port];
        res.json('ok');
    });

    router.get('/delete/:ip/:port/:video', (req, res) =>
    {
        delete this.list[req.params.ip][req.params.port][req.params.video];
        res.json('ok');
    });

    router.get('/delete/:ip/:port/:video/:piece', (req, res) =>
    {
        delete this.list[req.params.ip][req.params.port][req.params.video][req.params.piece];
        res.json('ok');
    });
};