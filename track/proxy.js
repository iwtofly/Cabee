let Ip      = require('_/ip');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.array  = {};
    this.io     = app.io.of('/proxy');

    this.io.on('connection', this.on_connect.bind(this));
};

mod.prototype.broadcast = function()
{
    this.io.emit(...arguments);
};

mod.prototype.list = function()
{
    let res = [];
    for (idx in this.array)
        res.push(this.array[idx]);
    return res;
};

// a new proxy connect to this track
mod.prototype.on_connect = function(socket)
{
    let ip = Ip.format(socket.request.connection.remoteAddress);
    this.app.log('proxy [%s] connected', ip);

    socket.on('disconnect', this.on_disconnect.bind(this, socket));
    socket.on('refresh', this.on_refresh.bind(this, socket));
};

// a proxy disconnect from this track
mod.prototype.on_disconnect = function(socket)
{
    let info = this.array[socket.id];
    this.app.log('proxy [%s|%s|%s|%s] disconnected',
        info.conf.group,
        info.ip,
        info.conf.port,
        info.conf.pos);
    delete this.array[socket.id];

    // notify other proxies
    this.refresh();
};

// a proxy emit a refresh event [cache pull/delete]
mod.prototype.on_refresh = function(socket, info)
{
    info.ip = Ip.format(socket.request.connection.remoteAddress);
  
    this.app.log('proxy [%s|%s|%s|%s] refreshed',
        info.conf.group,
        info.ip,
        info.conf.port,
        info.conf.pos);
    this.array[socket.id] = info;

    // notify other proxies
    this.refresh();
};

// refresh all connected proxies
mod.prototype.refresh = function()
{
    this.broadcast('refresh', this.app.server.list(), this.app.proxy.list());
};