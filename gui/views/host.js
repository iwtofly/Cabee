//================================== User ===================================//
class Unit
{
    constructor(ip, port)
    {
        this.ip   = ip;
        this.port = port;
    }

    log(text)
    {
        window.painter.log(this.to_string() + '| ' + text);
    }
};

//================================== User ===================================//
class User extends Unit
{
    to_string()
    {
        return 'U|' + this.ip + ':' + this.port;
    }
};

//================================== Host ===================================//
class Host extends Unit
{
    // painter must implement
    //     + msg(host, type[add/ping/upload/fetch/delete/...], text)
    //     + link(host1, host2, type[visit/pull/...], text)
    //     
    // logger must implement:
    //     + log(text)
    constructor(ip, port)
    {
        super(ip, port);
        this.url  = 'http://' + this.ip + ':' + this.port + '/gui';

        this.io = io(this.url);
        this.io.on('connect', this.on_connect.bind(this));
        this.io.on('disconnect', this.on_disconnect.bind(this));
    }

    static get(ip, port, pos)
    {
        console.log('get {0} {1} {2}'.format(ip, port, pos));

        for (let proxy of this.proxies)
        {
            if (pos == proxy.pos || (ip == proxy.ip && port == proxy.port))
            {
                return proxy;
            }
        }
        for (let server of this.servers)
        {
            if (ip == server.ip && port == server.port)
            {
                return server;
            }
        }
        for (let user of this.users)
        {
            if (ip == user.ip && port == user.port)
            {
                return user;
            }
        }
        let user = new User(ip, port);
        this.users.push(user);
        return user;
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
    constructor()
    {
        super(window.location.hostname, window.location.port);
        this.io.on('refresh', this.on_refresh.bind(this));
        this.io.on('push', this.on_push.bind(this));
    }

    to_string()
    {
        return 'T|{0}:{1}'.format(this.ip, this.port);
    }

    on_refresh(servers, proxies)
    {
        Host.track   = this;
        Host.servers = [];
        Host.proxies = [];
        Host.users   = [];
        Host.stations = [];

        for (let server of servers)
        {
            let ip = server.ip != '127.0.0.1' ? server.ip :
                     location.hostname != 'localhost' ? location.hostname : '127.0.0.1';

            Host.servers.push(new Server(ip, server.port, server.name, server.videos));
        }
        for (let proxy of proxies)
        {
            let ip = proxy.ip != '127.0.0.1' ? proxy.ip :
                     location.hostname != 'localhost' ? location.hostname : '127.0.0.1';

            Host.proxies.push(new Proxy(ip, proxy.port, proxy.name, proxy.pos, proxy.caches));
            if (proxy.pos.length == 2)
            {
                Host.stations.push(new Station("station", proxy.pos));
            }
        }

        console.log(Host.servers);
        console.log(Host.proxies);
        console.log(Host.stations)
        Host.networkinfo = new NetworkInfo("NetworkInfo");

        window.painter.tree(this, Host.servers, Host.proxies, Host.stations ,Host.networkinfo);
    }

    on_push(server_ip, server_port, video, piece)
    {
        let src = Host.get(server_ip, server_port);
        this.log('server [{0}] push [{1}|{2}] to proxies'
            .format(src.to_string(), video, piece));
        window.painter.broadcast(this, Host.proxies, 'push');
    }
};

//============================= Server & Proxy ==============================//

class RemoteHost extends Host
{
    constructor(ip, port, name)
    {
        super(ip, port);
        this.name = name;

        this.io.on('ping_bgn', this.on_ping_bgn.bind(this));
        this.io.on('ping_end', this.on_ping_end.bind(this));
        this.io.on('pong_bgn', this.on_pong_bgn.bind(this));
        this.io.on('pong_end', this.on_pong_end.bind(this));

        this.io.on('fetch_bgn', this.on_fetch_bgn.bind(this));
        this.io.on('fetch_end', this.on_fetch_end.bind(this));
        this.io.on('offer_bgn', this.on_offer_bgn.bind(this));
        this.io.on('offer_end', this.on_offer_end.bind(this));
    }

    // ping & pong
    on_ping_bgn(dst_ip, dst_port)
    {
        let dst = Host.get(dst_ip, dst_port);
        this.log('[PING] [{0}] begin'.format(dst.to_string()));
        window.painter.line(this, dst ,"ping","ping");
    }
    on_ping_end(dst_ip, dst_port, status, time)
    {
        let dst = Host.get(dst_ip, dst_port);
        this.log('[PING] [{0}] end [{1}] after [{2}]ms'.format(dst.to_string(), status, time));
        window.painter.unline(this, dst,"ping","ping");
    }
    on_pong_bgn(src_ip, src_pos)
    {
        let src = Host.get(src_ip, null, src_pos);
        this.log('[PONG] [{0}] begin'.format(src.to_string()));
        // window.painter.line(src, this ,"pong");
        // window.painter.line(this, src ,"pong");

    }
    on_pong_end(src_ip, src_pos, time)
    {
        let src = Host.get(src_ip, null, src_pos);
        this.log('[PONG] [{0}] end after [{1}]ms'.format(src.to_string(), time));
        // window.painter.unline(src,this);
        // window.painter.unline(this,src);

    }

    // fetch & offer
    on_offer_bgn(src_ip, src_pos, target)
    {
        let src = Host.get(src_ip, null, src_pos);
        this.log('[OFFER] [{0}] to [{1}] begin'.format(target, src.to_string()));
        window.painter.line(src, this ,"offer",'offer');
    }
    on_offer_end(src_ip, src_pos, target, time, status)
    {
        let src = Host.get(src_ip, null, src_pos);
        this.log('[OFFER] [{0}] to [{1}] end [{2}] after [{3}]ms'.format(target, src.to_string(), status, time));
        window.painter.unline(src, this,'offer','offer');
    }
    on_fetch_bgn(dst_ip, dst_port, target)
    {
        let dst = Host.get(dst_ip, dst_port);
        this.log('[FETCH] [{0}] from [{1}] begin'.format(target, dst.to_string(), dst.to_string()));
        // window.painter.line(this, dst ,"fetch",'fetch');
    }
    on_fetch_end(dst_ip, dst_port, target, time, status)
    {
        let dst = Host.get(dst_ip, dst_port);
        this.log('[FETCH] [{0}] from [{1}] end [{2}] after [{3}]ms'.format(target, dst.to_string(), status, time));
        // window.painter.unline(this, dst,"fetch",'fetch');
    }
};

// Server:
//     ip
//     port
//     name
class Server extends RemoteHost
{
    constructor(ip, port, name, videos)
    {
        super(ip, port, name);
        this.videos = videos;

        this.io.on('refresh', this.on_refresh.bind(this));
        this.io.on('push', this.on_push.bind(this));
    }

    on_refresh(info)
    {
        this.videos = videos;
        this.log('refreshed');
        window.painter.refresh(Host.servers,Host.proxies);
    }

    on_push(video, piece)
    {
        this.log('push [{0}|{1}]'.format(video, piece || 'all'));
        // window.painter.line(this, Host.track, 'push');
    }

    to_string()
    {
        return 'S|{0}:{1}|{2}'.format(this.ip, this.port, this.name);
    }
};

// Proxy:
//     ip
//     port
//     name
//     pos
class Proxy extends RemoteHost
{
    constructor(ip, port, name, pos, caches)
    {
        super(ip, port, name);
        this.pos = pos;
        this.caches = caches;

        this.io.on('refresh', this.on_refresh.bind(this));
    };

    on_refresh(info)
    {
        this.caches = info.caches;
        this.log('refreshed');
        window.painter.refresh(Host.servers,Host.proxies);
    }

    to_string()
    {
        return 'P|{0}:{1}|{2}|{3}'.format(this.ip, this.port, this.name, this.pos);
    }
};

// string format util
if (!String.prototype.format)
{
  String.prototype.format = function()
  {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number)
    { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

class Station extends Unit
{
    constructor( name, pos)
    {
        super();
        this.name = name;
        this.pos = pos;
    };
};

class NetworkInfo extends Unit
{
    constructor(name, pos)
    {
        super();
        this.name = name;
    };
};
