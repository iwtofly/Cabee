var yaml  = require('js-yaml');
var fs    = require('fs');

var Track  = require('./track');
var Server = require('./server');
var Proxy  = require('./proxy');

var conf = process.argv[2] || 'conf.sample.yaml';

try
{
    conf = yaml.safeLoad(fs.readFileSync(conf, 'utf8'));

    for (host of conf)
    {
        switch (host.type)
        {
            case 'track':
                host = new Track(host);
                break;

            case 'server':
                host = new Server(host);
                break;

            case 'proxy':
                host = new Proxy(host);
                break;
        }
    }
}
catch (e)
{
    console.log(e);
}
