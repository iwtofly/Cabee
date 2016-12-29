//================================== User ===================================//
class Unit
{
    log(text)
    {
        window.painter.log(this.to_string() + '| ' + text);
    }
};

//================================== User ===================================//
class User extends Unit
{
    constructor(ip, port)
    {
        super();

        this.ip = ip;
        this.conf = {};
        this.conf.port = port;
    }

    to_string()
    {
        return 'U|' + this.ip + ':' + this.conf.port;
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
    constructor(info)
    {
        super();

        for (let key in info)
            this[key] = info[key];

        this.url  = 'http://' + this.ip + ':' + this.conf.port + '/gui';

        this.io = io(this.url);
        this.io.on('connect', this.on_connect.bind(this));
        this.io.on('disconnect', this.on_disconnect.bind(this));

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
        let dst = window.get_host(dst_ip, dst_port);
        this.log('[PING] [{0}] begin'.format(dst.to_string()));
        // window.painter.line(this, dst ,"ping","ping");
    }
    on_ping_end(dst_ip, dst_port, status, time)
    {
        let dst = window.get_host(dst_ip, dst_port);
        this.log('[PING] [{0}] end [{1}] after [{2}]ms'.format(dst.to_string(), status, time));
        // window.painter.unline(this, dst,"ping","ping");
    }
    on_pong_bgn(src_ip, src_pos)
    {
        let src = window.get_host(src_ip, null, src_pos);
        this.log('[PONG] [{0}] begin'.format(src.to_string()));
        // window.painter.line(src, this ,"pong");
        // window.painter.line(this, src ,"pong");
    }
    on_pong_end(src_ip, src_pos, time)
    {
        let src = window.get_host(src_ip, null, src_pos);
        this.log('[PONG] [{0}] end after [{1}]ms'.format(src.to_string(), time));
        // window.painter.unline(src,this);
        // window.painter.unline(this,src);
    }
    // fetch & offer
    on_offer_bgn(src_ip, src_pos, target)
    {
        let src = window.get_host(src_ip, null, src_pos);
        this.log('[OFFER] [{0}] to [{1}] begin'.format(target, src.to_string()));
        // window.painter.line(src, this ,"offer",'offer');
    }
    on_offer_end(src_ip, src_pos, target, time, status)
    {
        let src = window.get_host(src_ip, null, src_pos);
        this.log('[OFFER] [{0}] to [{1}] end [{2}] after [{3}]ms'.format(target, src.to_string(), status, time));
        // window.painter.unline(src, this,'offer','offer');
    }
    on_fetch_bgn(dst_ip, dst_port, target)
    {
        let dst = window.get_host(dst_ip, dst_port);
        this.log('[FETCH] [{0}] from [{1}] begin'.format(target, dst.to_string(), dst.to_string()));
        // window.painter.line(this, dst ,"fetch",'fetch');
    }
    on_fetch_end(dst_ip, dst_port, target, time, status)
    {
        let dst = window.get_host(dst_ip, dst_port);
        this.log('[FETCH] [{0}] from [{1}] end [{2}] after [{3}]ms'.format(target, dst.to_string(), status, time));
        // window.painter.unline(this, dst,"fetch",'fetch');
    }

    on_connect()    { this.log('connected'); }
    on_disconnect() { this.log('disconnected'); }
};

//================================== Track ==================================//
//
//  ip
//  conf(port...)
//
class Track extends Host
{
    constructor(info)
    {
        super(info);

        this.io.on('push', this.on_push.bind(this));
    }

    to_string()
    {
        return 'T|{0}|{1}:{2}'.format
        (
            this.conf.group,
            this.ip,
            this.conf.port
        );
    }

    on_push(server_info, video, piece, proxy_infos)
    {
        let src = window.get_host(server_info);
        let proxies = [];
        for (let proxy_info of proxy_infos)
        {
            proxies.push(window.get_host(proxy_info));
        }
        this.log('server [{0}] push [{1}|{2}] to proxies'
            .format(src.to_string(), video, piece));
        // window.painter.broadcast(this, proxies, 'push');
    }
};

//================================= Server ==================================//
//
//  ip
//  conf(port...)
//  videos
//
class Server extends Host
{
    constructor(info)
    {
        super(info);

        this.io.on('refresh', this.on_refresh.bind(this));
        this.io.on('push', this.on_push.bind(this));
        this.io.on('progress', this.on_progress.bind(this));
    }

    to_string()
    {
        return 'S|{0}|{1}:{2}|{3}'.format
        (
            this.conf.group,
            this.ip,
            this.conf.port,
            this.conf.name
        );
    }

    on_refresh(info)
    {
        this.videos = info.videos;
        this.log('refreshed');
        window.painter.refresh();
    }

    on_push(video, piece)
    {
        this.log('push [{0}|{1}]'.format(video, piece || 'all'));
        // window.painter.line(this, Host.track, 'push');
    }

    on_progress(user_ip, video, piece, progress)
    {
        let src = window.get_host(user_ip, null, null);
        this.log('[{0}] => [{1}|{2}] at [{3}%]'.format(src.to_string(), video, piece, progress));
        // window.painter.
    }
};

//================================== Proxy ==================================//
//
//  ip
//  conf(port...)
//  caches
//
class Proxy extends Host
{
    constructor(info)
    {
        super(info);

        this.io.on('refresh', this.on_refresh.bind(this));
    }

    to_string()
    {
        return 'P|{0}|{1}:{2}|{3}|{4}'.format
        (
            this.conf.group,
            this.ip,
            this.conf.port,
            this.conf.name,
            this.conf.pos
        );
    }

    on_refresh(info)
    {
        this.caches = info.caches;
        this.log('refreshed');
        window.painter.refresh();
    }
};

//================================== Proxy ==================================//
//
//  ip
//  conf(port...)
//
class NetworkInfo extends Host
{
    constructor(info)
    {
        super(info);

        this.io.on('msg', this.on_msg.bind(this));
    }

    to_string()
    {
        return 'N|' + this.ip + ':' + this.conf.port;
    }

    on_msg()
    {
        console.log('(o_o)???');
    }
};


class Station extends Unit
{
    constructor( name, pos)
    {
        super();
        this.name = name;
        this.pos = pos;
    };
};

