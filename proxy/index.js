const HTTP_PORT = 12347;

var express    = require('express');
var nunjucks   = require('nunjucks');
var bodyParser = require('body-parser');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

nunjucks.configure('views',
{
    autoescape: true,
    express: app
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.static(require('./lib/_').filePath));

app.use('/track', require('./lib/_track'));
app.use('/cache', require('./lib/_cache'));
app.use('/proxy', require('./lib/_proxy'));
app.use('/pull', require('./lib/_pull'));
app.use('/fetch', require('./lib/_fetch'));

app.get('*', function(req, res)
{
    res.redirect('/track');
});

app.listen(HTTP_PORT);