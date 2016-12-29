var yaml  = require('js-yaml');
var fs    = require('fs');

var Gui    = require('./gui');
var NetIf  = require('./netif');
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
            case 'gui':
                new Gui(host);
                break;

            case 'netif':
                new NetIf(host);
                break;

            case 'track':
                new Track(host);
                break;

            case 'server':
                new Server(host);
                break;

            case 'proxy':
                new Proxy(host);
                break;
        }
    }
}
catch (e)
{
    console.log(e);
}
