var io = require('socket.io-client');

module.exports = Link;

function Link(url)
{
    this.connected = false;
    this.socket    = io(url);
    
    this.socket.on('connect', () => this.connected = true);
    this.socket.on('disconnect', () => this.connected = false);
};

Link.prototype.reconnect = function()
{
    this.socket.reconnect();
};

Link.prototype.disconnect = function()
{
    if (this.socket)
        this.socket.disconnect();
};

Link.prototype.on = function(event, callback)
{
    if (this.socket)
        this.socket.on(event, callback.bind(this));
};

Link.prototype.emit = function(func, data)
{
    this.socket.emit(func, data);
};