let express = require('express');
let Ip      = require('_/ip');

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
    this.app.log('proxy [' + Ip.format(socket.request.connection.remoteAddress) + '] connected');
    socket.on('disconnect', this.on_disconnect.bind(this, socket));
    socket.on('refresh', this.on_refresh.bind(this, socket));
    // notify other proxies & users(gui)
    this.app.gui.refresh();
    this.refresh();
};

// a proxy disconnect from this track
mod.prototype.on_disconnect = function(socket)
{
    this.app.log('proxy [' + Ip.format(socket.request.connection.remoteAddress) + '] disconnected');
    // notify other proxies & users(gui)
    this.app.gui.refresh();
    this.refresh();
};

// a proxy emit a refresh event [cache pull/delete]
mod.prototype.on_refresh = function(socket, data)
{
    data.ip = Ip.format(socket.request.connection.remoteAddress);
    this.app.log('proxy [' + data.ip + '] refreshed');
    for (let i = 0; i < this.list.length; ++i)
    {
        if (this.list[i].pos == data.pos)
        {
            this.list.splice(i, 1);
            break;
        }
    }
    this.list.push(data);
    // notify other proxies
    this.refresh();
};

// refresh all connected proxies
mod.prototype.refresh = function()
{
    this.io.emit('refresh', this.app.server.list, this.app.proxy.list);
};

// push to all proxies
mod.prototype.push = function(server_ip, server_port, video, piece)
{
    this.io.emit('push', server_ip, server_port, video, piece);
};