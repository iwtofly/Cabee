let path    = require('path');
let request = require('request');

let mod = module.exports = function(ip, port, video, piece)
{
    this.ip    = ip;
    this.port  = port;
    this.video = video;
    this.piece = piece;
};

mod.prototype.toString = function()
{
    return this.ip + ':' + this.port + '|' + this.video + '|' + this.piece;
}

mod.prototype.url = function()
{
    return 'http://' + this.ip + ':' + this.port + '/video/' + this.video + '/' + this.piece;
};

mod.prototype.path = function(dir)
{
    return path.join(dir, this.ip, '' + this.port, this.video, this.piece);
};

mod.prototype.fetch = function(pos, callback)
{
    request(
    {
        'url'      : this.url() + '/' + pos,
        'encoding' : null
    },
    (error, response, body) =>
    {
        callback(error, response, body);
    });
};