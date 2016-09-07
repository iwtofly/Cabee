class Host
{
    // painter must implement
    //     + msg(host, type[add/ping/upload/fetch/delete/...], text)
    //     + link(host1, host2, type[visit/pull/...], text)
    //     
    // logger must implement:
    //     + log(text)
    constructor(conf, painter, logger = console)
    {    
        this.ip   = conf.ip;
        this.port = conf.port;
        this.name = conf.name;

        this.url  = 'http://' + this.ip + ':' + this.port + '/gui';

        this.painter = painter;
        this.logger  = logger;
    };

    log(text)
    {
        logger.log(this.info() + '  ' + text);
    };
};

class Track extends Host
{
    info() { return 'T|' + this.name + '|' + this.ip + ':' + this.port; };
};

class Server extends Host
{
    info() { return 'S|' + this.name + '|' + this.ip + ':' + this.port; };
};

class Proxy extends Host
{
    constructor(conf)
    {
        super(conf);
        this.pos = conf.pos;
    };

    info() { return 'P|' + this.name + '|' + this.ip + ':' + this.port + '|' + this.pos; };
};