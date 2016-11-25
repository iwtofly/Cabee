let express = require('express');
let url     = require('url');
let Link    = require('_/link');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.url    = app.conf.track;
    this.link   = new Link(app.conf.track);
    this.router = express.Router(app);

    let parsed_url = url.parse(this.url);
    this.ip   = parsed_url.hostname;
    this.port = parsed_url.port;

    this.init();
};

mod.prototype.init = function()
{
    let router = this.router;
    let link   = this.link;

    router.put('/reconnect', (req, res) =>
    {
        link.reconnect();
        res.json('ok');
    });

    router.put('/disconnect', (req, res) =>
    {
        link.disconnect();
        res.json('ok');
    });

    router.get('/connected', (req, res) =>
    {
        res.json(link.connected);
    });
};

mod.prototype.emit = function()
{
    this.link.emit(...arguments);
};