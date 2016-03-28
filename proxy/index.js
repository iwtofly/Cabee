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

app.get('/', function(req, res)
{
    res.redirect('/track');
});

app.use(require('./lib/fetch'));
app.use(require('./lib/track'));
app.use(require('./lib/cache'));
app.use(require('./lib/delay'));
app.use(require('./lib/proxy'));
app.use(require('./lib/server'));

app.get('*', function(req, res)
{
    res.render('404.j2');
});

app.listen(HTTP_PORT);