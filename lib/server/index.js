var express    = require('express');
var nunjucks   = require('nunjucks');
var bodyParser = require('body-parser');
var path       = require('path');

module.exports = function(port)
{
    var app = express();

    nunjucks.configure(__dirname + '/view',
    {
        autoescape: true,
        express: app
    });

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(express.static('./static'));

    app.use('/track', require('./track'));
    app.use('/video', require('./video'));

    app.get('*', (req, res) => { res.render('main.j2'); });

    app.listen(port);
}