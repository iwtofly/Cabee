let request = require('request');
let ipaddr  = require('ipaddr.js');

let mod = module.exports = function(conf, caches = {})
{
    this.conf   = conf;
    this.caches = caches;
};

mod.fromJson = function(json)
{
    let res = new mod(json.conf, json.caches);
    res.ip = ipaddr.parse(json.ip).toIPv4Address();
    return res;
};

mod.prototype.has = function(cache)
{
    return this.caches[cache.ip] &&
           this.caches[cache.ip][cache.port] &&
           this.caches[cache.ip][cache.port][cache.video] &&
           this.caches[cache.ip][cache.port][cache.video].indexOf(cache.piece) != -1;
};

mod.prototype.ping = function(pos, callback)
{
    let url = 'http://' + this.ip + ':' + this.conf.port + '/delay/ping/' + pos;

    // fetch file directly from source server
    request(
    {
        'url'      : url,
        'json'     : true,
        'timeout'  : 3000,
    },
    (error, response, body) =>
    {
        if (error)
        {
            callback(error);
        }
        else if (response.statusCode != 200)
        {
            callback("HTTP status != 200");
        }
        else
        {
            callback(undefined, body);
        }
    });
};