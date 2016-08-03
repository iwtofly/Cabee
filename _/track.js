var io = require('socket.io-client');

module.exports = track;

function track()
{
    this.connected = false;
};

track.prototype.config = function(config)
{
    this.config = config;
};

track.prototype.connect = function()
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

track.prototype.disconnect = function()
{
    if (this.socket)
        this.socket.disconnect();
    this.socket = undefined;
};

track.prototype.on = function(event, callback)
{
    this.socket.on(event, callback);
};

track.prototype.call = function(func, data, callback)
{
    this.socket.emit(func, data);
    this.socket.on(func + '_callback', (res) =>
    {
        callback(res);
    });
};