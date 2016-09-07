let express = require('express');
let Link    = require('_/link');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.link   = new Link(app.conf.track);
    this.router = express.Router(app);

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