let express = require('express');
let Ip      = require('_/ip');

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
    this.app.log('server [' + Ip.format(socket.request.connection.remoteAddress) + '] connected');
    socket.on('disconnect', this.on_disconnect.bind(this, socket));
    socket.on('refresh', this.on_refresh.bind(this, socket));
    socket.on('push', this.on_push.bind(this, socket));
    // notify both proxies & users(gui)
    this.app.proxy.refresh();
    this.app.gui.refresh();
};

// a server disconnect from this track
mod.prototype.on_disconnect = function(socket)
{
    this.app.log('server [' + Ip.format(socket.request.connection.remoteAddress) + '] disconnected');
    // notify both proxies & users(gui)
    this.app.proxy.refresh();
    this.app.gui.refresh();
};

// a server emit a refresh event [video upload/delete]
mod.prototype.on_refresh = function(socket, data)
{
    data.ip = Ip.format(socket.request.connection.remoteAddress);
    this.list.push(data);
    this.app.log('server [' + data.ip + '] notified');
    // notify proxies
    this.app.proxy.refresh();
};

// 
mod.prototype.on_push = function(socket, server_port, video, piece)
{
    let ip = Ip.format(socket.request.connection.remoteAddress);
    this.app.gui.io.emit('push', ip, server_port, video, piece);
    this.app.proxy.push(ip, server_port, video, piece);
};