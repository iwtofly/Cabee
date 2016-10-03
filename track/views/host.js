//================================== Host ===================================//
class Host
{
    // painter must implement
    //     + msg(host, type[add/ping/upload/fetch/delete/...], text)
    //     + link(host1, host2, type[visit/pull/...], text)
    //     
    // logger must implement:
    //     + log(text)
    constructor(painter, ip, port)
    {
        this.painter = painter;
        this.ip      = ip;
        this.port    = port;
        this.url     = 'http://' + this.ip + ':' + this.port + '/gui';

        this.log('try connecting to ' + this.url);

        this.io = io(this.url);
        this.io.on('connect', this.on_connect.bind(this));
        this.io.on('disconnect', this.on_disconnect.bind(this));
    }

    log(text)
    {
        this.painter.log('[' + this.prefix + '] ' + text);
    }
    
    on_connect()    { this.log('connected'); }
    on_disconnect() { this.log('disconnected'); }
};

//================================== Track ==================================//

// Track:
//     ip
//     port
class Track extends Host
{
    constructor(painter)
    {
        super(painter, window.location.hostname, window.location.port);
        this.prefix = 'T|' + this.ip + ':' + this.port;

        this.io.on('refresh', this.on_refresh.bind(this));
    }

    on_refresh(servers, proxies)
    {
        let ss = [];
        let ps = [];

        for (let server of servers)
        {
            ss.push(new Server(this.painter, server.ip, server.port, server.name));
        }
        for (let proxy of proxies)
        {
            ps.push(new Proxy(this.painter, proxy.ip, proxy.port, proxy.name, proxy.pos));
        }

        this.painter.tree(this, ss, ps);
    }
};

//============================= Server & Proxy ==============================//

class RemoteHost extends Host
{
    constructor(painter, ip, port, name)
    {
        super(painter, ip, port);
        this.name = name;

        this.io.on('event', this.on_event.bind(this));
    }
};

// Server:
//     ip
//     port
//     name
class Server extends RemoteHost
{
    constructor(painter, ip, port, name)
    {
        super(painter, ip, port, name);
        this.prefix = 'S|' + ip + ':' + port + '|' + name;
    }
};

// Proxy:
//     ip
//     port
//     name
//     pos
class Proxy extends RemoteHost
{
    constructor(painter, ip, port, name, pos)
    {
        super(painter, ip, port, name);
        this.prefix = 'P|' + ip + ':' + port + '|' + name + '|' + pos;
        this.pos = pos;
    };
};