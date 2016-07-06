// global const
const PATH_ROOT   = '/';
const PATH_APP    = PATH_ROOT + '/APP';

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

// start app
switch (process.argv.length > 2 ? process.argv[2] : 's')
{
    case 'server':
    case 's':
        require('./app/server/index.js')(conf.server.port);
    break;

    case 'track':
    case 't':


    break;

    case 'proxy':
    case 'p':


    break;
}