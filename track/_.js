var servers = module.exports.servers = {};
var proxies = module.exports.proxies = {};

var io_server;
var io_proxy;

module.exports.init = (http) =>
{
    var io = require('socket.io')(http);

    io_server = io.of('/server');
    io_proxy  = io.of('/proxy');
    
    io_server.on('connection', server_connect);
    io_proxy.on('connection', proxy_connect);
};

// server
function server_connect(socket)
{
    var ip = socket.request.connection.remoteAddress;
    console.log('server [' + ip + '] connected');
    servers[ip] = {};
    socket.on('disconnect', server_disconnect);
    socket.on('update', server_update);
    io_proxy.emit('update_server', servers);
};

function server_disconnect()
{
    ip = this.request.connection.remoteAddress;
    console.log('server [' + ip + '] disconnected');
    servers[ip] = undefined;
    io_proxy.emit('update_servers', servers);
};

function server_update(data)
{
    ip = this.request.connection.remoteAddress;
    servers[ip] = data;
    console.log('server [' + ip + '] updated');
    io_proxy.emit('update_servers', servers);
};

// proxy
function proxy_connect(socket)
{
    var ip = socket.request.connection.remoteAddress;
    console.log('proxy [' + ip + '] connected');
    proxies[ip] = {};
    socket.on('disconnect', server_disconnect);
    io_proxy.emit('update_proxies', proxies);
};

function proxy_disconnect()
{
    var ip = socket.request.connection.remoteAddress;
    console.log('proxy [' + ip + '] disconnected');
    proxies[ip] = undefined;
    io_proxy.emit('update_proxies', proxies);
};