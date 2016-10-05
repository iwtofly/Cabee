let express    = require('express');
let nunjucks   = require('nunjucks');
let bodyParser = require('body-parser');
let http       = require('http');
let path       = require('path');
let io         = require('socket.io');
let ipaddr     = require('ipaddr.js');

let Ip      = require('_/ip');
let Server  = require('./server');
let Proxy   = require('./proxy');
let Gui     = require('./gui');

let app = module.exports = function(conf)
{
    this.conf = conf;
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
    this.expr.use(express.static('track/views'));

    this.server = new Server(this);
    this.proxy  = new Proxy(this);
    this.gui    = new Gui(this);

    this.expr.use('/server', this.server.router);
    this.expr.use('/proxy', this.proxy.router);
    this.expr.use('/gui', this.gui.router);

    this.expr.get('*', (req, res) => { res.status(404).end('404 not found'); });

    this.http.listen(conf.port);
};

app.prototype.info = function()
{
    return ret =
    {
        port : this.conf.port,
        name : this.conf.name
    };
};

app.prototype.log = function(text)
{
    console.log('T|' + this.conf.name +
                 '|' + this.conf.port +
                 '|  ' + text);
};