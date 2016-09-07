let express    = require('express');
let nunjucks   = require('nunjucks');
let bodyParser = require('body-parser');
let http       = require('http');
let path       = require('path');
let io         = require('socket.io');

let Track = require('_/track');
let Delay = require('_/delay');
let Gui   = require('_/gui');
let Video = require('./video');

let app = module.exports = function(conf)
{
    this.conf = conf;
    this.expr = express();
    this.http = http.Server(this.expr);
    this.io   = io(http);

    nunjucks.configure(__dirname + '/views',
    {
        autoescape: true,
        express: this.expr
    });

    this.expr.use(bodyParser.urlencoded({extended: true}));
    this.expr.use(bodyParser.json());
    this.expr.use(express.static('_static'));

    this.delay = new Delay(this);
    this.video = new Video(this);
    this.track = new Track(this);
    this.gui   = new Gui(this);

    this.track.link.on('connect', () => { this.notify(); });

    this.expr.use('/delay', this.delay.router);
    this.expr.use('/video', this.video.router);
    this.expr.use('/track', this.track.router);

    this.expr.get('/ring', () => { this.gui.io.emit('ring', 'ring ring ring!'); });
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

app.prototype.notify = function()
{
    this.track.link.emit('notify', this.info());
};

app.prototype.log = function(text)
{
    console.log('S|' + this.conf.name +
                 '|' + this.conf.port +
                 '|  ' + text);
};