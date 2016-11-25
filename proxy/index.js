let express    = require('express');
let nunjucks   = require('nunjucks');
let bodyParser = require('body-parser');
let http       = require('http');
let path       = require('path');
let request    = require('request');
let io         = require('socket.io');
let util       = require('util');
let ipaddr     = require('ipaddr.js');
let File       = require('_/file');
let Proxy      = require('_/proxy');

let Ip    = require('_/ip');
let Delay = require('_/delay');
let Track = require('_/track');
let Gui   = require('_/gui');
let Cache = require('./cache');
let Relay = require('./relay');
let Push  = require('./push');
let Count = require('./count');

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

    this.delay = new Delay(this);
    this.track = new Track(this);
    this.cache = new Cache(this);
    this.relay = new Relay(this);
    this.gui   = new Gui(this);
    this.push  = new Push(this);
    this.count = new Count(this);

    this.track.link.on('connect', () => this.refresh());
    this.track.link.on('refresh', this.on_refresh.bind(this));
    this.track.link.on('push', this.push.on_push.bind(this.push));

    this.expr.get('/server', (req, res) => { res.json(this.servers); });
    this.expr.get('/proxy',  (req, res) => { res.json(this.proxies); });

    this.expr.use('/',      this.relay.router);
    this.expr.use('/delay', this.delay.router);
    this.expr.use('/track', this.track.router);
    this.expr.use('/cache', this.cache.router);
    this.expr.use('/count', this.count.router);

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
    let proxy = this.conf;
    proxy.caches = this.cache.list();
    return new Proxy(proxy);
};

app.prototype.refresh = function()
{
    this.track.emit('refresh', this.info());
    this.gui.emit('refresh', this.info());
};

app.prototype.on_refresh = function(servers, proxies)
{
    this.servers = servers;
    this.proxies = [];
    for (proxy of proxies)
    {
        proxy.ip = proxy.ip == '127.0.0.1' ? this.track.ip : proxy.ip;
        this.proxies.push(new Proxy(proxy));
    }
};

app.prototype.log = function()
{
    console.log('P|' + this.conf.name +
                 '|' + this.conf.port +
                 '|' + this.conf.pos +
                 '|  ' + util.format(...arguments));
};
