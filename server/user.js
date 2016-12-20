let mod = module.exports = function(app)
{
    this.app = app;
    this.io  = app.io.of('/user');

    this.io.on('connection', this.on_connect.bind(this));
};

mod.prototype.on_connect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('user [%s] connected', ip);

    socket.on('disconnect', this.on_disconnect.bind(this, socket));
    socket.on('progress', this.on_progress.bind(this, socket));
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

mod.prototype.on_progress = function(socket, video, piece, progress)
{
	let ip = socket.request.connection.remoteAddress;
	this.app.log('user [%s] download [%s|%s] for [%s]', ip, video, piece, progress);
    
    // notify gui-page about this users' downloading progress
    this.app.gui.emit('progress', ip, video, piece, progress);
};