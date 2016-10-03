let express = require('express');
let ipaddr  = require('ipaddr.js');

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
    socket.on('refresh',     this.on_refresh.bind(this, socket));
    this.app.gui.refresh();
    this.refresh();
};

// a proxy disconnect from this track
mod.prototype.on_disconnect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('proxy [' + ip + '] disconnected');
    this.app.gui.refresh();
    this.refresh();
};

// a proxy emit a refresh event [cache pull/delete]
mod.prototype.on_refresh = function(socket, data)
{
    data.ip = ipaddr.parse(socket.request.connection.remoteAddress).toIPv4Address().toString();
    this.app.log('proxy [' + data.ip + '] notified');
    this.list.push(data);
    this.refresh();
};

// refresh all connected proxies
mod.prototype.refresh = function()
{
    this.io.emit('refresh', this.app.server.list, this.app.proxy.list);
};