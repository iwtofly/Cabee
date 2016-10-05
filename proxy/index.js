let express    = require('express');
let nunjucks   = require('nunjucks');
let bodyParser = require('body-parser');
let http       = require('http');
let path       = require('path');
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

    this.track.link.on('connect', () => this.refresh());
    this.track.link.on('refresh', this.on_refresh.bind(this));

    this.expr.get('/server', (req, res) => { res.json(this.servers); });
    this.expr.get('/proxy',  (req, res) => { res.json(this.proxies); });

    this.expr.use('/delay', this.delay.router);
    this.expr.use('/track', this.track.router);
    this.expr.use('/cache', this.cache.router);
    this.expr.use('/',      this.relay.router);

    this.http.listen(conf.port);
};

app.prototype.refresh = function()
{
    let proxy = this.conf;
    proxy.caches = this.cache.list();
    this.track.link.emit('refresh', new Proxy(proxy));
};

app.prototype.on_refresh = function(servers, proxies)
{
    this.servers = servers;
    this.proxies = [];
    for (proxy of proxies)
    {
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

app.prototype.save = function(cache, buffer)
{
    let res = File.save(cache.path(this.dir), buffer);
    if (res)
    {
        this.refresh();
    }
    return res;
};