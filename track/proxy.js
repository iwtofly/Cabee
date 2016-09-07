let express = require('express');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.list   = [];
    this.router = express.Router();
    this.io     = app.io.of('/proxy');

    this.io.on('connection', this.on_connect.bind(this));

    this.init();
};

mod.prototype.init = function()
{
    let router = this.router;

    router.get('/', (req, res) =>
    {
        res.json(this.list);
    });
};

// a new proxy connect to this track
mod.prototype.on_connect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('proxy [' + ip + '] connected');
    socket.on('disconnect', this.on_disconnect.bind(this, socket));
    socket.on('notify',     this.on_notify.bind(this, socket));
    this.app.gui.notify();
    this.notify();
};

// a proxy disconnect from this track
mod.prototype.on_disconnect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('proxy [' + ip + '] disconnected');
    this.app.gui.notify();
    this.notify();
};

// a proxy emit a notify event [cache pull/delete]
mod.prototype.on_notify = function(socket, data)
{
    data.ip = socket.request.connection.remoteAddress;
    this.app.log('proxy [' + data.ip + '] notified');
    this.list.push(data);
    this.notify();
};

// notify all connected proxies
mod.prototype.notify = function()
{
    this.io.emit('notify', this.app.server.list, this.app.proxy.list);
};