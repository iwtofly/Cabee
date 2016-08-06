var request = require('request');

var delay   = module.exports.delay   = new (require('_/delay'));
var track   = module.exports.track   = new (require('_/link'));
var config  = module.exports.config  = {};
var servers = module.exports.servers = {};
var proxies = module.exports.proxies = {};
var pings   = module.exports.pings   = {};

module.exports.init = (conf) =>
{
    this.config = conf;
    for (cidr in conf.delay)
    {
        delay.add(cidr, conf.delay[cidr]);
    }
    track.init(conf.track);
    track.connect();

    track.on('update_servers', (data) => { this.servers = data; });
    track.on('update_proxies', (data) => { this.proxies = data; });
};