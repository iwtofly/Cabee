let express    = require('express');
let nunjucks   = require('nunjucks');
let bodyParser = require('body-parser');
let http       = require('http');
let path       = require('path');
let io         = require('socket.io');

let Track = require('_/track');
let Proxy = require('_/proxy');
let Delay = require('_/delay');
let Cache = require('./cache');
let Mitm  = require('./mitm');

let app = module.exports = function(conf)
{
    this.conf = conf;
    this.dir  = path.join(__dirname, 'caches', conf.port.toString());
    
    this.expr = express();
    this.http = http.Server(this.expr);
    this.io   = io(http).of('/gui');

    nunjucks.configure(__dirname + '/views',
    {
        autoescape: true,
        express: this.expr
    });

    // set up web-service
    this.expr.use(bodyParser.urlencoded({extended: true}));
    this.expr.use(bodyParser.json());
    this.expr.use(express.static('_static'));

    this.delay = new Delay(this);
    this.cache = new Cache(this);
    this.track = new Track(this);
    this.mitm  = new Mitm(this);

    this.track.link.on('connect', () => this.notify());
    this.track.link.on('notify', this.on_notify.bind(this));

    this.expr.use('/delay', this.delay.router);
    this.expr.use('/cache', this.cache.router);
    this.expr.use('/track', this.track.router);

    this.expr.get('/server', (req, res) => { res.json(this.servers); });
    this.expr.get('/proxy', (req, res) => { res.json(this.proxies); });

    this.expr.use('/', this.mitm.router);

    this.http.listen(conf.port);
};

app.prototype.notify = function()
{
    this.track.link.emit('notify', new Proxy(this.conf, this.cache.list()));
};

app.prototype.on_notify = function(servers, proxies)
{
    this.servers = servers;

    this.proxies = [];
    for (proxy of proxies)
    {
        this.proxies.push(Proxy.fromJson(proxy));
    }
};

app.prototype.log = function(text)
{
    console.log('P|' + this.conf.name +
                 '|' + this.conf.port +
                 '|' + this.conf.pos +
                 '|  ' + text);
};