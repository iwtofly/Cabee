let express    = require('express');
let nunjucks   = require('nunjucks');
let bodyParser = require('body-parser');
let http       = require('http');
let util       = require('util');
let io         = require('socket.io');

let Host = require('./host');
let User = require('./user');

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

    // socket-io
    this.host = new Host(this);
    this.user = new User(this);

    // HTTP
    this.expr.get('/hosts', (req, res) => { res.json(this.host.list); });

    this.expr.get('/', (req, res) => { res.render('main.j2')});
    
    this.expr.get('*', (req, res) => { res.status(404).end('404 not found'); });

    this.http.listen(conf.port);
};

app.prototype.log = function()
{
    console.log('G|' + this.conf.port +
                 '|  ' + util.format(...arguments));
};