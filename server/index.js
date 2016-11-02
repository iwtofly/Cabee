let express    = require('express');
let nunjucks   = require('nunjucks');
let bodyParser = require('body-parser');
let http       = require('http');
let path       = require('path');
let util       = require('util');
let io         = require('socket.io');

let Ip    = require('_/ip');
let Track = require('_/track');
let Delay = require('_/delay');
let Gui   = require('_/gui');
let Video = require('./video');
let Push  = require('./push');

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
    this.expr.use(express.static('server/views'));
    
    this.delay = new Delay(this);
    this.track = new Track(this);
    this.gui   = new Gui(this);
    this.video = new Video(this);
    this.push  = new Push(this);

    this.track.link.on('connect', () => { this.refresh(); });

    this.expr.use('/delay', this.delay.router);
    this.expr.use('/video', this.video.router);
    this.expr.use('/track', this.track.router);
    this.expr.use('/push', this.push.router);

    this.expr.get("/home/",(req,res)=> { 
        
        res.render('cabee-Users/index.html',{
            'list':this.video.list()
        }); 

        console.log("videolist"+this.video.list());
    });
    this.expr.get('*', (req, res) => { res.status(404).end('404 not found'); });

    this.http.listen(conf.port);
};

app.prototype.info = function()
{
    return ret =
    {
        port   : this.conf.port,
        name   : this.conf.name,
        videos : this.video.list()
    };
};

app.prototype.refresh = function()
{
    this.track.link.emit('refresh', this.info());
};

app.prototype.log = function()
{
    console.log('S|' + this.conf.name +
                 '|' + this.conf.port +
                 '|  ' + util.format(...arguments));
};