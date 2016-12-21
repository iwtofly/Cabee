let request = require('request');

let mod = module.exports = function(json)
{
    this.ip     = json.ip;
    this.conf   = json.conf;
    this.videos = json.videos;
};

mod.prototype.toString = function()
{
    return this.ip + ':' + this.conf.port;
};

mod.prototype.has = function(piece)
{
  for (video in this.videos)
    if (video == piece.video && this.videos.IndexOf(piece.piece) != -1)
      return true;
};