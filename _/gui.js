//
// this module contains both:
//
//     client : connect to GUI node
//     server : let GUI user connect to this host
//

let io = require('socket.io-client');
let Ip = require('_/ip');

let mod = module.exports = function(app)
{
    this.app = app;
    this.url = app.conf.gui;

    // server
    this.server = app.io.of('/gui');
    this.server.on('connection', this.on_user_connect.bind(this));

    // client
    this.client = io(app.conf.gui);
    this.client.on('connect', this.on_gui_connect.bind(this));
    this.client.on('disconnect', this.on_gui_disconnect.bind(this));
};

//
// send events to gui-users by client
//
mod.prototype.emit = function()
{
    this.server.emit(...arguments);
};

//
// server events
//
mod.prototype.on_user_connect = function(socket)
{
    let ip = Ip.format(socket.request.connection.remoteAddress);
    this.app.log('Gui-user [%s] connected', ip);

    socket.on('disconnect', this.on_user_disconnect.bind(this, socket));
};
mod.prototype.on_user_disconnect = function(socket)
{
    let ip = Ip.format(socket.request.connection.remoteAddress);
    this.app.log('Gui-user [%s] disconnected', ip);
};

//
// client events
//
mod.prototype.on_gui_connect = function(socket)
{
    this.app.log('connect to Gui [%s]', this.url);

    // send self-info to gui
    this.client.emit('refresh', this.app.info());
};
mod.prototype.on_gui_disconnect = function(socket)
{
    this.app.log('disconnect to Gui [%s]', this.url);
};