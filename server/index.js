let express    = require('express');
let nunjucks   = require('nunjucks');
let bodyParser = require('body-parser');
let http       = require('http');
let path       = require('path');
let util       = require('util');
let io         = require('socket.io');

let Track = require('_/track');
let Delay = require('_/delay');
let Gui   = require('_/gui');
let Video = require('./video');
let Push  = require('./push');
let User  = require('./user');

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
    this.expr.use(express.static(__dirname + '/views'));

    // socket-io
    this.track = new Track(this);
    this.gui   = new Gui(this);
    this.user  = new User(this);
    
    // HTTP
    this.delay = new Delay(this);
    this.video = new Video(this);
    this.push  = new Push(this);

    this.expr.use('/delay', this.delay.router);
    this.expr.use('/video', this.video.router);
    this.expr.use('/push', this.push.router);

    this.expr.get('/', (req,res) => { 
        res.render('cabee-Users/index.html', {
            'list':this.video.list()
        });
    });
    this.expr.get('*', (req, res) => { res.status(404).end('404 not found'); });

    this.http.listen(conf.port);
};

app.prototype.info = function()
{
    return ret =
    {
        conf   : this.conf,
        videos : this.video.list()
    };
};

app.prototype.refresh = function()
{
    this.track.emit('refresh', this.info());
    this.gui.emit('refresh', this.info());
    this.gui.broadcast('refresh', this.info());
};

app.prototype.log = function()
{
    console.log('S|' + this.conf.group +
                 '|' + this.conf.name +
                 '|' + this.conf.port +
                 '|  ' + util.format(...arguments));
};