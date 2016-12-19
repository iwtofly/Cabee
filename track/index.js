let express    = require('express');
let nunjucks   = require('nunjucks');
let bodyParser = require('body-parser');
let http       = require('http');
let path       = require('path');
let io         = require('socket.io');
let ipaddr     = require('ipaddr.js');

let Server  = require('./server');
let Proxy   = require('./proxy');

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
    // and what the fuck is this ???
    this.expr.use(express.static('track/views'));

    this.server = new Server(this);
    this.proxy  = new Proxy(this);

    this.expr.use('/server', this.server.router);
    this.expr.use('/proxy', this.proxy.router);
    
    this.expr.get('/', (req, res) =>
    {
        res.json(
        {
            'proxy' : this.proxy.list,
            'server': this.server.list
        });
    });
    this.expr.get('*', (req, res) => { res.status(404).end('404 not found'); });

    this.http.listen(conf.port);
};

app.prototype.log = function(text)
{
    console.log('T|' + this.conf.name +
                 '|' + this.conf.port +
                 '|  ' + text);
};