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

mod.prototype.on_connect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    console.log('server [' + ip + '] connected');
    socket.on('disconnect', this.on_disconnect.bind(this, socket));
    socket.on('notify',     this.on_nofity.bind(this, socket));
};

mod.prototype.on_disconnect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    console.log('server [' + ip + '] disconnected');
};

mod.prototype.on_nofity = function(socket, data)
{
    data.ip = socket.request.connection.remoteAddress;
    this.list.push(data);
    console.log('server [' + data.ip + '] notified');
    this.app.proxy.io.emit('server', this.list);
    this.app.gui.io.emit('server', this.list);
};