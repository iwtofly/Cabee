let Ip = require('_/ip');

let mod = module.exports = function(app)
{
    this.app = app;
    this.io = app.io.of('/host');
    this.array = {};
    this.io.on('connection', this.on_connect.bind(this));
};

mod.prototype.emit = function()
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

mod.prototype.on_connect = function(socket)
{
    let ip = Ip.format(socket.request.connection.remoteAddress);
    this.app.log('host [%s] connected', ip);

    socket.on('disconnect', this.on_disconnect.bind(this, socket));

    // hosts notify gui that something has changed about themselves
    socket.on('refresh', this.on_refresh.bind(this, socket));
};

mod.prototype.on_disconnect = function(socket)
{
    let info = this.array[socket.id];
    this.app.log('host [%s|%s|%s|%s] disconnected', info.conf.type, info.conf.group, info.ip, info.conf.port);
    delete this.array[socket.id];
};

mod.prototype.on_refresh = function(socket, info)
{
    info.ip = Ip.format(socket.request.connection.remoteAddress);
    this.app.log('host [%s|%s|%s|%s] refreshed', info.conf.type, info.conf.group, info.ip, info.conf.port);
    this.array[socket.id] = info;
};