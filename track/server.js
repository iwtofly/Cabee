let Ip      = require('_/ip');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.array  = {};
    this.io     = app.io.of('/server');

    this.io.on('connection', this.on_connect.bind(this));
};

mod.prototype.list = function()
{
    let res = [];
    for (idx in this.array)
        res.push(this.array[idx]);
    return res;
};

// a new server connect to this track
mod.prototype.on_connect = function(socket)
{
    let ip = Ip.format(socket.request.connection.remoteAddress);
    this.app.log('server [%s] connected', ip);
    
    socket.on('disconnect', this.on_disconnect.bind(this, socket));
    socket.on('refresh', this.on_refresh.bind(this, socket));
    socket.on('push', this.on_push.bind(this, socket));
};

// a server disconnect from this track
mod.prototype.on_disconnect = function(socket)
{
    let info = this.array[socket.id];
    this.app.log('server [%s|%s|%s] disconnected', info.conf.group, info.ip, info.conf.port);
    delete this.array[socket.id];

    // notify all proxies
    this.app.proxy.refresh();
};

// a server emit a refresh event [video upload/delete]
mod.prototype.on_refresh = function(socket, info)
{
    info.ip = Ip.format(socket.request.connection.remoteAddress);
    this.app.log('server [%s|%s|%s] refreshed', info.conf.group, info.ip, info.conf.port);
    this.array[socket.id] = info;
    
    // notify proxies
    this.app.proxy.refresh();
};

// 
mod.prototype.on_push = function(socket, server_port, video, piece)
{
    let info = this.array[socket.id];

    this.app.log('server [%s|%s|%s] push [%s|%s]',
        info.conf.group,
        info.ip,
        info.conf.port,
        video,
        piece);

    this.app.gui.emit('push', info, video, piece);

    // let proxy-module emit the 'push' event
    this.app.proxy.push(server_info, video, piece);
};