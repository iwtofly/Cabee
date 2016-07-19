const HTTP_PORT = 12346;

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

app.use('/proxy', require('./lib/_proxy'));
app.use('/server', require('./lib/_server'));

app.get('*', function(req, res)
{
    res.redirect('/proxy');
});

app.listen(HTTP_PORT);