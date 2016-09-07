let express = require('express');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.list   = [];
    this.router = express.Router();
    this.io     = app.io.of('/server');

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

// a new server connect to this track
mod.prototype.on_connect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('server [' + ip + '] connected');
    socket.on('disconnect', this.on_disconnect.bind(this, socket));
    socket.on('notify',     this.on_notify.bind(this, socket));
    this.app.proxy.notify();
    this.app.gui.notify();
};

// a server disconnect from this track
mod.prototype.on_disconnect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('server [' + ip + '] disconnected');
    this.app.proxy.notify();
    this.app.gui.notify();
};

// a server emit a notify event [video upload/delete]
mod.prototype.on_notify = function(socket, data)
{
    data.ip = socket.request.connection.remoteAddress;
    this.list.push(data);
    this.app.log('server [' + data.ip + '] notified');
    this.app.proxy.notify();
};