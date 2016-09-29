let request = require('request');

let mod = module.exports = function(json)
{
    this.ip     = json.ip;
    this.port   = json.port;
    this.name   = json.name;
    this.pos    = json.pos;
    this.caches = json.caches;
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
        'json'     : true
    },
    (error, response, body) =>
    {
        callback(error, response, body);
    });
};

mod.prototype.relay = function(cache, pos, callback)
{
    let url = 'http://' +
               this.ip + ':' + this.port +
               '/cache/' +
               cache.ip + '/' +
               cache.port + '/' +
               cache.video + '/' +
               cache.piece + '/' +
               pos;
               
    // fetch file directly from source server
    request(
    {
        'url'      : url,
        'encoding' : null
    },
    (error, response, body) =>
    {
        callback(error, response, body);
    });
};