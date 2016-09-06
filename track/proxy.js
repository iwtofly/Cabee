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

mod.prototype.on_connect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    console.log('proxy [' + ip + '] connected');

    socket.on('disconnect', this.on_disconnect.bind(this, socket));
    socket.on('notify',     this.on_nofity.bind(this, socket));
};

mod.prototype.on_disconnect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    console.log('proxy [' + ip + '] disconnected');
};

mod.prototype.on_nofity = function(socket, data)
{
    data.ip = socket.request.connection.remoteAddress;
    console.log('proxy [' + data.ip + '] notified');
    this.list.push(data);
    this.io.emit('proxy', this.list);
    this.app.gui.io.emit('proxy', this.list);
};