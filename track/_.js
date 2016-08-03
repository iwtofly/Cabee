var servers = module.exports.servers = {};
var proxies = module.exports.proxies = {};

module.exports.init = (http) =>
{
    var io = require('socket.io')(http);

    io.of('/server').on('connection', server_connect);
    io.of('/proxy').on('connection', proxy_connect);
};

function server_connect(socket)
{
    var ip = socket.request.connection.remoteAddress;
    console.log('server [' + ip + '] connected');
    servers[ip] = {};
    socket.on('disconnect', server_disconnect);
};

function server_disconnect()
{
    ip = this.request.connection.remoteAddress;
    console.log('server [' + ip + '] disconnected');
    servers[ip] = undefined;
};

function proxy_connect(socket)
{
    var ip = socket.request.connection.remoteAddress;
    console.log('proxy [' + ip + '] connected');
    proxies[ip] = {};
    socket.on('disconnect', server_disconnect);
};

function proxy_disconnect()
{
    var ip = socket.request.connection.remoteAddress;
    console.log('proxy [' + ip + '] disconnected');
    proxies[ip] = undefined;
};