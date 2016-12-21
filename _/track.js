let url = require('url');
let io  = require('socket.io-client');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.url    = app.conf.track;
    
    let parsed_url = url.parse(this.url);
    this.ip   = parsed_url.hostname;
    this.port = parsed_url.port;

    this.client = io(this.url);

    this.client.on('connect', this.on_track_connect.bind(this));
    this.client.on('disconnect', this.on_track_disconnect.bind(this));
};

mod.prototype.emit = function()
{
    this.client.emit(...arguments);
};

mod.prototype.on = function(event, callback)
{
    this.client.on(event, callback);
};

//
mod.prototype.on_track_connect = function(socket)
{
    this.app.log('connect to Track [%s]', this.url);
    
    // notify track about my info
    this.emit('refresh', this.app.info());
};
mod.prototype.on_track_disconnect = function(socket)
{
    this.app.log('disconnect to Track [%s]', this.url);
};