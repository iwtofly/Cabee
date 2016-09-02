var express    = require('express');
var nunjucks   = require('nunjucks');
var bodyParser = require('body-parser');
var path       = require('path');

module.exports = function(config)
{
    require('./_.js').init(config);

    var app = express();
    var http = require('http').Server(app);

    nunjucks.configure(__dirname + '/views',
    {
        autoescape: true,
        express: app
    });

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(express.static('_static'));

    app.use('/track', require('./track'));
    app.use('/video', require('./video'));
    app.use('/delay', require('./delay'));
    app.get('/ring', (req, res) => { require('./_.js').track.emit('update', 'shit'); res.end('ring!!!'); });

    app.get('*', (req, res) => { res.status(404).end(); });

    http.listen(config.port);

    // public-pub-service(normally on port 80)
    var pub = express();

    pub.use(bodyParser.urlencoded({extended: true}));
    pub.use(bodyParser.json());

    pub.use(require('./pub'));
    pub.get('*', (req, res) => { res.status(404).end(); });

    pub.listen(config.pub);
};