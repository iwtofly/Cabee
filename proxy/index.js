let express    = require('express');
let nunjucks   = require('nunjucks');
let bodyParser = require('body-parser');
let http       = require('http');
let path       = require('path');
let io         = require('socket.io');

let Track = require('_/track');
let Delay = require('_/delay');
let Cache = require('./cache');

let app = module.exports = function(conf)
{
    this.conf = conf;
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

    this.track.link.on('connect', () => this.notify());
    this.track.link.on('server', this.on_server.bind(this));
    this.track.link.on('proxy', this.on_proxy.bind(this));

    this.expr.use('/delay', this.delay.router);
    this.expr.use('/cache', this.cache.router);
    this.expr.use('/track', this.track.router);

    this.expr.get('/server', (req, res) => { res.json(this.servers); });
    this.expr.get('/proxy', (req, res) => { res.json(this.proxies); });
    this.expr.get('*', (req, res) => { res.status(404).end('404 not found'); });

    this.http.listen(conf.port);
};

app.prototype.info = function()
{
    return ret =
    {
        port   : this.conf.port,
        name  : this.conf.name,
        pos   : this.conf.pos,
        caches: this.cache.list()
    };
};

app.prototype.notify = function()
{
    this.track.link.emit('notify', this.info());
};

app.prototype.on_server = function(data)
{
    this.servers = data;
};

app.prototype.on_proxy = function(data)
{
    this.proxies = data;
};