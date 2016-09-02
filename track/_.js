var servers = module.exports.servers = {};
var proxies = module.exports.proxies = {};

var io_server;
var io_proxy;
var io_gui;

module.exports.init = (http) =>
{
    var io = require('socket.io')(http);

    io_server = io.of('/server');
    io_proxy  = io.of('/proxy');
    io_gui    = io.of('/gui');
    
    io_server.on('connection', server_connect);
    io_proxy.on('connection', proxy_connect);
    io_gui.on('connection', gui_connect);
};

// server
function server_connect(socket)
{
    var ip = socket.request.connection.remoteAddress;
    console.log('server [' + ip + '] connected');
    // update records
    servers[ip] = {};
    // bind events
    socket.on('disconnect', server_disconnect);
    socket.on('update', server_update);
    // notify proxies & guis
    io_proxy.emit('server/update', servers);
    io_gui.emit('server/update', servers);
};

function server_disconnect()
{
    ip = this.request.connection.remoteAddress;
    console.log('server [' + ip + '] disconnected');
    // update records
    servers[ip] = undefined;
    // notify proxies & guis
    io_proxy.emit('server/update', servers);
    io_gui.emit('server/update', servers);
};

function server_update(data)
{
    ip = this.request.connection.remoteAddress;
    console.log('server [' + ip + '] updated');
    // update records
    servers[ip] = data;
    // notify proxies & guis
    io_proxy.emit('server/update', servers);
    io_gui.emit('server/update', servers);
};

// proxy
function proxy_connect(socket)
{
    var ip = socket.request.connection.remoteAddress;
    console.log('proxy [' + ip + '] connected');
    // update records
    proxies[ip] = {};
    // bind events
    socket.on('disconnect', server_disconnect);
    // notify proxies & guis
    io_proxy.emit('proxy/update', proxies);
    io_gui.emit('proxy/update', proxies);
};

function proxy_disconnect()
{
    var ip = socket.request.connection.remoteAddress;
    console.log('proxy [' + ip + '] disconnected');
    // update record
    proxies[ip] = undefined;
    // notify proxies & guis
    io_proxy.emit('proxy/update', proxies);
    io_gui.emit('proxy/update', proxies);
};

function proxy_update()
{
    ip = this.request.connection.remoteAddress;
    console.log('proxy [' + ip + '] updated');
    // update records
    proxies[ip] = data;
    // notify proxies & guis
    io_proxy.emit('proxy/update', proxies);
    io_gui.emit('proxy/update', proxies);
}

// gui
function gui_connect(socket)
{
    var ip = socket.request.connection.remoteAddress;
    console.log('gui [' + ip + '] connected');
    socket.on('disconnect', gui_disconnect);
};

function gui_disconnect()
{
    ip = this.request.connection.remoteAddress;
    console.log('gui [' + ip + '] disconnected');
};