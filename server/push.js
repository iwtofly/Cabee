let express = require('express');
let path    = require('path');
let util    = require('util');
let File    = require('_/file');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.router = express.Router();

    this.init();
};

mod.prototype.init = function()
{
    let app    = this.app;
    let router = this.router;

    router.get('/', (req, res) =>
    {
        res.render('push.j2', {'list' : app.video.list()});
    });

    router.get(
    [
        '/:video',
        '/:video/:piece'
    ],
    (req, res) =>
    {
        app.gui.emit('push', req.params.video, req.params.piece);

        app.track.link.emit('push', app.conf.port, req.params.video, req.params.piece);

        res.json('ok');
    });
}