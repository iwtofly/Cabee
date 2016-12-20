let mod = module.exports = function(app)
{
    this.app = app;
    this.io = app.io.of('/host');
    this.list = [];
    this.io.on('connection', this.on_connect.bind(this));
};

mod.prototype.on_connect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('host [%s] connected', ip);

    socket.on('disconnect', this.on_disconnect.bind(this, socket));

    // hosts notify gui that something has changed about themselves
    socket.on('refresh', this.on_refresh.bind(this, socket));
};

mod.prototype.on_disconnect = function(socket)
{
    let ip = socket.request.connection.remoteAddress;
    this.app.log('host [%s] disconnected', ip);
};

mod.prototype.emit = function()
{
    this.io.emit(...arguments);
};

mod.prototype.on_refresh = function(socket, info)
{
    info.ip = socket.request.connection.remoteAddress;

    this.app.log('host [%s|%s|%s|%s] refreshed', info.conf.type, info.conf.group, info.ip, info.conf.port);

    for (idx in this.list)
    {
        if (this.list[idx].conf.type  == info.conf.type &&
            this.list[idx].conf.group == info.conf.group &&
            this.list[idx].conf.ip    == info.conf.ip)
        {
            this.list[idx] = info;
            return;
        }
    }
    this.list.push(info);
};