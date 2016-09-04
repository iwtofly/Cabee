let express = require('express');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.list   = {};
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
    console.log('user [' + ip + '] connected');
    this.list[ip] = {};
    socket.on('disconnect', this.on_disconnect.bind(this, socket));
};

mod.prototype.on_disconnect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    console.log('user [' + ip + '] disconnected');
    delete this.list[ip];
};