var express    = require('express');
var nunjucks   = require('nunjucks');
var bodyParser = require('body-parser');
var path       = require('path');

module.exports = function(config)
{
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

    app.get('*', (req, res) => { res.status(404).end(); });

    require('./_.js').init(config.delay, config.track);

    http.listen(config.port);
};