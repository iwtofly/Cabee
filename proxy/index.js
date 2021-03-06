let express    = require('express');
let nunjucks   = require('nunjucks');
let bodyParser = require('body-parser');
let http       = require('http');
let path       = require('path');
let request    = require('request');
let io         = require('socket.io');
let util       = require('util');
let File       = require('_/file');
let Ip         = require('_/ip');

let Delay = require('_/delay');
let Track = require('_/track');
let Gui   = require('_/gui');

let Proxy  = require('./model/proxy');
let Server = require('./model/server');

let NetIf = require('./model/netif');
let Cache = require('./cache');
let Relay = require('./relay');
let Count = require('./count');
let Push  = require('./push');

let app = module.exports = function(conf)
{
    this.conf = conf;
    this.dir  = path.join(__dirname, 'caches', conf.port.toString());
    
    this.expr = express();
    this.http = http.Server(this.expr);
    this.io   = io(this.http);

    nunjucks.configure(__dirname + '/views',
    {
        autoescape: true,
        express: this.expr
    });

    this.expr.use(bodyParser.urlencoded({extended: true}));
    this.expr.use(bodyParser.json());
    this.expr.use(express.static('_static'));

    // socket-io
    this.gui   = new Gui(this);
    this.track = new Track(this);
    this.netif = new NetIf(this);

    // http
    this.delay = new Delay(this);
    this.cache = new Cache(this);
    this.relay = new Relay(this);
    this.push  = new Push(this);
    this.count = new Count(this);

    this.track.on('refresh', this.on_refresh.bind(this));
    this.track.on('push', this.push.on_push.bind(this.push));

    // intercept users' req for video, imitate server's /video URL
    this.expr.use('/video', this.relay.router);

    // normal URL
    this.expr.use('/delay', this.delay.router);
    this.expr.use('/cache', this.cache.router);
    this.expr.use('/count', this.count.router);
    this.expr.get('/', (req, res) => { res.json(
    {
            server: this.servers,
            proxy : this.proxies
    }); });

    // pipe other URL
    this.expr.all('*', (req, res) =>
    {
        //console.log('============');
        //console.log('protocal: ' + req.protocol);
        //console.log('host: ' + req.get('host'));
        //console.log('ip: ' + req.ip);
        //console.log('url: ' + req.url);
        //console.log('original url: ' + req.originalUrl);
        //console.log('path: ' + req.path);
        //console.log('base url: ' + req.baseUrl);
        
        let url = req.protocol + '://'
                + req.get('host')
                + req.path
                + (req.url.indexOf('?') != -1 ? req.url.substr(req.url.indexOf('?')) : '');
        this.log('pipe: [%s] => [%s]', req.ip, url);
        //res.json('you shall not pass!!!');
        req.pipe(request[req.method.toLowerCase()](url)).on('error', (err) =>
        {
            this.log('pipe: [%s] => [%s] begin failed with [%s]', req.ip, url, err);
        })
        .pipe(res).on('error', (err) =>
        {
            this.log('pipe: [%s] => [%s] end failed with [%s]', req.ip, url, err);
        });
        //res.status(404).end('fuck you');
    });

    this.http.listen(conf.port);
};

app.prototype.info = function()
{
    return ret = 
    {
        conf   : this.conf,
        caches : this.cache.list()
    };
};

app.prototype.refresh = function()
{
    // tell track
    this.track.emit('refresh', this.info());
    // tell gui-host
    this.gui.emit('refresh', this.info());
    // tell gui-user
    this.gui.broadcast('refresh', this.info());
};

app.prototype.on_refresh = function(servers, proxies)
{
    this.servers = [];
    for (server of servers)
    {
        server.ip = server.ip == '127.0.0.1' ? this.track.ip : server.ip;
        this.servers.push(new Server(server));
    }
    this.proxies = [];
    for (proxy of proxies)
    {
        proxy.ip = proxy.ip == '127.0.0.1' ? this.track.ip : proxy.ip;
        this.proxies.push(new Proxy(proxy));
    }
};

app.prototype.log = function()
{
    console.log('P|' + this.conf.group +
                 '|' + this.conf.name +
                 '|' + this.conf.port +
                 '|' + this.conf.pos +
                 '|  ' + util.format(...arguments));
};
