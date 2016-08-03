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

if (process.argv.length < 3)
{
    console.log('usage:  node index.js [stp]');
    process.exit()
}

if (process.argv[2].indexOf('s') > -1)
{
    require('./server/index.js')(conf.server);
}
if (process.argv[2].indexOf('t') > -1)
{
    require('./track/index.js')(conf.track);
}
if (process.argv[2].indexOf('p') > -1)
{
    require('./proxy/index.js')(conf.proxy);
}