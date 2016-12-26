let request = require('request');

let mod = module.exports = function(json)
{
    this.ip     = json.ip;
    this.conf   = json.conf;
    this.caches = json.caches;
};

mod.prototype.toString = function()
{
    return this.conf.group + '|' +
           this.ip + ':' + this.conf.port + '|' +
           this.conf.pos;
};

mod.prototype.has = function(piece)
{
    return this.caches[piece.ip] &&
           this.caches[piece.ip][piece.port] &&
           this.caches[piece.ip][piece.port][piece.video] &&
           this.caches[piece.ip][piece.port][piece.video].indexOf(piece.piece) != -1;
};

mod.prototype.ping = function(pos, callback)
{
    let url = 'http://' + this.ip + ':' + this.conf.port + '/delay/ping/' + pos;

    // fetch file directly from source server
    request(
    {
        'url'  : url,
        'json' : true
    },
    (error, response, body) =>
    {
        callback(error, response, body);
    });
};

mod.prototype.relay = function(piece, pos, callback)
{
    let url = 'http://' +
               this.ip + ':' + this.conf.port +
               '/cache/' +
               piece.ip + '/' +
               piece.port + '/' +
               piece.video + '/' +
               piece.piece + '/' +
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