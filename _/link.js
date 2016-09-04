var io = require('socket.io-client');

module.exports = Link;

function Link(url)
{
    this.url       = url;
    this.connected = false;
    this.events    =
    {
        'connect'    : this.on_connect,
        'disconnect' : this.on_disconnect
    };
};

Link.prototype.connect = function()
{
    if (!this.socket)
    {
        this.socket = io(this.url);
        for (event in this.events)
        {
            this.on(event, this.events[event]);
        }
    }
    else if (!this.connected)
    {
        this.socket.reconnect();
    }
};

Link.prototype.disconnect = function()
{
    if (this.socket)
        this.socket.disconnect();
    delete this.socket;
};

Link.prototype.on = function(event, callback)
{
    this.socket.on(event, callback.bind(this));
};

Link.prototype.emit = function(func, data)
{
    this.socket.emit(func, data);
};

Link.prototype.on_connect = function()
{
    this.connected = true;
};

Link.prototype.on_disconnect = function()
{
    this.connected = false;
};