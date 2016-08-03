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
    app.use(express.static('../_static'));

    app.use('/server', require('./server'));

    app.get('*', (req, res) => { res.render('main.j2'); });

    require('./_.js').init(http);

    http.listen(config.port);
};