let express = require('express');

let mod = module.exports = function(app)
{
    this.app = app;
    this.router = express.Router();
    this.router.get('/', (req, res) =>
    {
        res.render('main.j2');
    });

    this.io  = app.io.of('/gui');
    this.io.on('connection', this.on_connect.bind(this));
};

mod.prototype.on_connect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('user [' + ip + '] connected');
    socket.on('disconnect', this.on_disconnect.bind(this, socket));

    this.refresh();
};

mod.prototype.on_disconnect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('user [' + ip + '] disconnected');
};

mod.prototype.emit = function()
{
    this.io.emit(...arguments);
};

mod.prototype.refresh = function()
{
    this.io.emit('refresh', this.app.server.list, this.app.proxy.list);
};