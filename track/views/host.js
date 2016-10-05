//================================== Unit ===================================//
class Unit
{
    constructor(ip)
    {
        this.ip = ip;
    }

    log(text)
    {
        window.painter.log(this.to_string() + '| ' + text);
    }

    line(dst, type, text)
    {
        window.painter.line(this, dst, type, text);
    }

    unline(dst, type, text)
    {
        window.painter.line(this, dst);
    }

    msg(type, text)
    {
        window.painter.msg(this, type, text);
    }
};

//================================== User ===================================//
class User extends Unit
{
    to_string()
    {
        return 'U|' + this.ip;
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
        super(ip);
        this.port = port;
        this.url  = 'http://' + this.ip + ':' + this.port + '/gui';

        this.io = io(this.url);
        this.io.on('connect', this.on_connect.bind(this));
        this.io.on('disconnect', this.on_disconnect.bind(this));
    }

    static get(ip, pos_or_port)
    {
        for (let proxy of this.proxies)
        {
            if (pos_or_port == proxy.pos)
            {
                return proxy;
            }
        }
        for (let server of this.servers)
        {
            if (ip == server.ip && pos_or_port == server.port)
            {
                return server;
            }
        }
        return new User(ip);
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
    }

    to_string()
    {
        return 'T|{0}:{1}'.format(this.ip, this.port);
    }

    on_refresh(servers, proxies)
    {
        Host.servers = [];
        Host.proxies = [];

        for (let server of servers)
        {
            Host.servers.push(new Server(server.ip, server.port, server.name));
        }
        for (let proxy of proxies)
        {
            Host.proxies.push(new Proxy(proxy.ip, proxy.port, proxy.name, proxy.pos));
        }

        window.painter.tree(this, Host.servers, Host.proxies);
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
    on_ping_bgn(dst_ip, dst_pos)
    {
        let dst = Host.get(dst_ip, dst_pos);
        this.log('[PING] [{0}] begin'.format(dst.to_string()));
        this.line(dst);
    }
    on_ping_end(dst_ip, dst_pos, status, time)
    {
        let dst = Host.get(dst_ip, dst_pos);
        this.log('[PING] [{0}] end [{1}] after [{2}]ms'.format(dst.to_string(), status, time));
        this.unline(dst);
    }
    on_pong_bgn(src_ip, src_pos)
    {
        let src = Host.get(src_ip, src_pos);
        this.log('[PONG] [{0}] begin'.format(src.to_string()));
        this.line(src);
    }
    on_pong_end(src_ip, src_pos, time)
    {
        let src = Host.get(src_ip, src_pos);
        this.log('[PONG] [{0}] end after [{1}]ms'.format(src.to_string(), time));
        this.unline(src);
    }

    // fetch & offer
    on_offer_bgn(src_ip, src_pos, target)
    {
        let src = Host.get(src_ip, src_pos);
        this.log('[OFFER] [{0}] to [{1}] begin'.format(target, src.to_string()));
        this.line(src);
    }
    on_offer_end(src_ip, src_pos, target, time, status)
    {
        let src = Host.get(src_ip, src_pos);
        this.log('[OFFER] [{0}] to [{1}] end [{2}] after [{3}]ms'.format(target, src.to_string(), status, time));
        this.line(src);
    }
    on_fetch_bgn(dst_ip, dst_port, target)
    {
        let dst = Host.get(dst_ip, dst_port);
        this.log('[FETCH] [{0}] from [{1}] begin'.format(target, dst.to_string(), dst.to_string()));
        this.line(dst);
    }
    on_fetch_end(dst_ip, dst_port, target, time, status)
    {
        let dst = Host.get(dst_ip, dst_port);
        this.log('[FETCH] [{0}] from [{1}] end [{2}] after [{3}]ms'.format(target, dst.to_string(), status, time));
        this.line(dst);
    }
};
 
// Server:
//     ip
//     port
//     name
class Server extends RemoteHost
{
    constructor(ip, port, name)
    {
        super(ip, port, name);
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
    constructor(ip, port, name, pos)
    {
        super(ip, port, name);
        this.pos = pos;
    };

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