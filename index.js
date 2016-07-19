// load configuration
try
{
    var yaml = require('js-yaml');
    var fs   = require('fs');
    var conf = yaml.safeLoad(fs.readFileSync('conf.yaml', 'utf8'));
}
catch (e)
{
    console.log(e);
    exit();
}

var static = require('express').static('_static');

// start app
switch (process.argv.length > 2 ? process.argv[2] : 's')
{
    case 'server':
    case 's':
        require('./server/index.js')(conf.server.port, static);
    break;

    case 'track':
    case 't':
        require('./track/index.js')(conf.track.port, static);
    break;

    case 'proxy':
    case 'p':
        require('./proxy/index.js')(conf.proxy.port, static);
    break;
}