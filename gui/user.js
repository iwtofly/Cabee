let mod = module.exports = function(app)
{
    this.app = app;
    this.io = app.io.of('/user');
    this.io.on('connection', this.on_connect.bind(this));
};

mod.prototype.on_connect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('user [%s] connected', ip);

    socket.on('disconnect', this.on_disconnect.bind(this, socket));

    // when user connect to socket-io, send host list so that user can connect to them
    socket.emit('refresh', this.app.host.list);
};

mod.prototype.on_disconnect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('user [%s] disconnected', ip);
};

mod.prototype.emit = function()
{
    this.io.emit(...arguments);
};