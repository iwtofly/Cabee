var servers = module.exports.servers = [];
var proxies = module.exports.proxies = [];

module.exports.init = (http) =>
{
    var io = require('socket.io')(http);

    io.of('/server').on('connection', server_connect);
    io.of('/proxy').on('connection', server_connect);
};

function server_connect(socket)
{
    console.log('server [' + socket.request.connection.remoteAddress + '] connected');
    socket.on('disconnect', server_disconnect);
};

function server_disconnect()
{
    console.log('server [' + this.request.connection.remoteAddress + '] disconnected');
};

function proxy_connect(socket)
{
    console.log('proxy [' + socket.request.connection.remoteAddress + '] connected');
    socket.on('disconnect', server_disconnect);
};

function proxy_disconnect()
{
    console.log('proxy [' + this.request.connection.remoteAddress + '] disconnected');
};