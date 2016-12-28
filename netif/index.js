let express    = require('express');
let nunjucks   = require('nunjucks');
let bodyParser = require('body-parser');
let http       = require('http');
let path       = require('path');
let util       = require('util');
let io         = require('socket.io');

let Gui = require('_/gui');

let app = module.exports = function(conf)
{
    this.conf = conf;
    this.expr = express();
    this.http = http.Server(this.expr);
    this.io   = io(this.http);
    this.io.on('connect', this.on_connect.bind(this));

    nunjucks.configure(__dirname + '/views',
    {
        autoescape: true,
        express: this.expr
    });

    // socket-io
    this.gui = new Gui(this);
    
    this.expr.get('*', (req, res) => { res.json('(o_o)???'); });

    this.http.listen(conf.port);
};

app.prototype.info = function()
{
    return ret =
    {
        conf : this.conf
    };
};

app.prototype.log = function()
{
    console.log('N|' + this.conf.group +
                 '|' + this.conf.name +
                 '|' + this.conf.port +
                 '|  ' + util.format(...arguments));
};

app.prototype.on_connect = function(socket)
{
    socket.on('msg', () =>
    {
        this.gui.broadcast('msg');
    });
};