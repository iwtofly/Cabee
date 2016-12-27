let request = require('request');
let Slice   = require('./slice');

let mod = module.exports = function(json)
{
    this.ip     = json.ip;
    this.conf   = json.conf;
    this.videos = json.videos;
};

mod.prototype.toString = function()
{
    return this.conf.group + '|' + this.ip + ':' + this.conf.port;
};

mod.prototype.has = function(slice)
{
    for (let video in this.videos)
        if (video == slice.video && this.videos[video].indexOf(slice.piece) != -1)
            return true;
    return false;
};

// get rest slices in slice.video
mod.prototype.rest_of = function(slice)
{
    if (!this.videos[slice.video]) return [];
    res = [];
    for (let piece of this.videos[slice.video])
    {
        if (piece != slice.piece)
            res.push(new Slice(this.ip, this.conf.port, slice.video, piece));
    }
    return res;
};