class Host
{
    // painter must implement
    //     + msg(host, type[add/ping/upload/fetch/delete/...], text)
    //     + link(host1, host2, type[visit/pull/...], text)
    //     
    // logger must implement:
    //     + log(text)
    constructor(painter, logger = console)
    {
        this.painter = painter;
        this.logger  = logger;
    };

    log(text)
    {
        logger.log(this.prefix + '  ' + text);
    };
};

class Track extends Host
{
    constructor(painter, logger)
    {
        super(painter, logger);
        this.io = io('/gui');
        this.prefix = 'T|' + this.name + '|' + this.ip + ':' + this.port;
    }
};

class RemoteHost extends Host
{
    constructor(info, painter, logger)
    {
        super(painter, logger);
        this.port = info.port;
        this.name = info.name;
        this.ip   = info.ip;

        this.url = 'http://' + this.ip + ':' + this.port + '/gui';
        this.io  = io(this.url);
    }
};

class Server extends RemoteHost
{
    constructor(info, painter, logger)
    {
        super(info, painter, logger);
        this.prefix = 'S|' + this.name + '|' + this.ip + ':' + this.port; 
    }
};

class Proxy extends RemoteHost
{
    constructor(info, painter, logger)
    {
        super(info, painter, logger);
        this.pos = info.pos;
        this.prefix = 'P|' + this.name + '|' + this.ip + ':' + this.port + '|' + this.pos;
    };
};