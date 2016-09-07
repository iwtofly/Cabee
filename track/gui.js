let express = require('express');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.router = express.Router();
    this.io     = app.io.of('/gui');

    this.io.on('connection', this.on_connect.bind(this));

    this.init();
};

mod.prototype.init = function()
{
    let router = this.router;

    router.get('/', (req, res) =>
    {
        res.render('main.j2');
    });
};

mod.prototype.on_connect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('user [' + ip + '] connected');
    socket.on('disconnect', this.on_disconnect.bind(this, socket));

    this.notify();
};

mod.prototype.on_disconnect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('user [' + ip + '] disconnected');
};

mod.prototype.notify = function()
{
    this.io.emit('notify', this.app.server.list, this.app.proxy.list);
};