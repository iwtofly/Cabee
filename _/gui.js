let mod = module.exports = function(app)
{
    this.app = app;
    this.io  = app.io.of('/gui');

    this.io.on('connection', this.on_connect.bind(this));
};

mod.prototype.on_connect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('user [' + ip + '] connected');

    socket.on('disconnect', this.on_disconnect.bind(this, socket));
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