const HTTP_FRONT_PORT = 80;
const HTTP_BACK_PORT  = 12345;

var express    = require('express');
var nunjucks   = require('nunjucks');
var bodyParser = require('body-parser');
var multer     = require('multer');


/*========== front ==========*/

var front = express();

front.set('views', __dirname + '/views');
front.set('view engine', 'html');

nunjucks.configure('views',
{
    autoescape: true,
    express: front
});

front.use(bodyParser.urlencoded({extended: true}));
front.use(bodyParser.json());
front.use(express.static('public'));

front.use(require('./lib/_front'));

front.listen(HTTP_FRONT_PORT);


/*========== back ==========*/

var back = express();

back.set('views', __dirname + '/views');
back.set('view engine', 'html');

nunjucks.configure('views',
{
    autoescape: true,
    express: back
});

back.use(bodyParser.urlencoded({extended: true}));
back.use(bodyParser.json());
back.use(express.static('public'));
back.use(express.static('media'));

back.use('/media', require('./lib/_media'));
back.use('/track', require('./lib/_track'));
back.use('/delay', require('./lib/_delay'));

back.get('*', function(req, res)
{
    res.redirect('/track');
});

back.listen(HTTP_BACK_PORT);