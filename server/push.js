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

    router.put(
    [
        '/:video',
        '/:video/:piece'
    ],
    (req, res) =>
    {
        app.gui.broadcast('push', req.params.video, req.params.piece);
        app.track.emit('push', req.params.video, req.params.piece);

        res.json('ok');
    });
}