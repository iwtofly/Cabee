let url = require('url');
let io  = require('socket.io-client');

let mod = module.exports = function(app)
{
    this.app = app;
    this.url = app.conf.netif;
    
    let parsed_url = url.parse(this.url);
    this.ip   = parsed_url.hostname;
    this.port = parsed_url.port;

    this.client = io(this.url);

    this.client.on('connect', this.on_netif_connect.bind(this));
    this.client.on('disconnect', this.on_netif_disconnect.bind(this));
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
mod.prototype.on_netif_connect = function(socket)
{
    this.app.log('connect to NetworkInfo [%s]', this.url);
    
    // notify netif about my info
    this.emit('refresh', this.app.info());
};
mod.prototype.on_netif_disconnect = function(socket)
{
    this.app.log('disconnect to NetworkInfo [%s]', this.url);
};