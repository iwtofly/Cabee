let path    = require('path');
let request = require('request');

let cache = module.exports = function(ip, port, video, piece)
{
    this.ip    = ip;
    this.port  = port;
    this.video = video;
    this.piece = piece;
};

cache.prototype.url = function()
{
    return 'http://' + this.ip + ':' + this.port + '/video/' + this.video + '/' + this.piece;
};

cache.prototype.path = function(dir)
{
    return path.join(dir, this.ip, this.port, this.video, this.piece);
};

cache.prototype.fetch = function(callback)
{
    request(
    {
        'url'      : this.url(),
        'encoding' : null
    },
    (error, response, body) =>
    {
        callback(error, response, body);
    });
};