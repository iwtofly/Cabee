var io = require('socket.io-client');

module.exports = link;

function link()
{
    this.connected = false;
};

link.prototype.init = function(config)
{
    this.config = config;
};

link.prototype.connect = function()
{
    if (!this.socket)
    {
        this.socket = io.connect(this.config.url,
        {
            reconnect: true,
            reconnectionDelay: this.config.retry,
            reconnectionDelayMax: this.config.retry_max,
            timeout: this.config.timeout
        });

        this.socket.on('connect', () =>
        {
            this.connected = true;
        });

        this.socket.on('disconnect', () =>
        {
            this.connected = false;
        });
    }
    else if (!this.connected)
    {
        this.socket.reconnect();
    }
};

link.prototype.disconnect = function()
{
    if (this.socket)
        this.socket.disconnect();
    this.socket = undefined;
};

link.prototype.on = function(event, callback)
{
    this.socket.on(event, callback);
};

link.prototype.emit = function(func, data)
{
    this.socket.emit(func, data);
};