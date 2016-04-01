var fs   = require('fs');
var url  = require('url');
var path = require('path');

module.exports = cache;

var hits = {};

function cache(fileURL, dir)
{
    var info = url.parse(fileURL);

    // http://10.1.1.1/kantai-1.jpg
    this.url      = fileURL;
    // /kantai-1.jpg
    this.name     = info.pathname;
    // E:\Cabee\proxy\cache
    this.dir      = dir;
    // http%3A%2F%2F10.1.1.1%2Fkantai-1.jpg
    this.filename = encodeURIComponent(this.url);
    // /http%253A%252F%252F10.1.1.1%252Fkantai-1.jpg
    this.href     = '/' + encodeURIComponent(this.filename);
    // E:\Cabee\proxy\cache\http%3A%2F%2F10.1.1.1%2Fkantai-1.jpg
    this.path     = path.join(dir, this.filename);
    // .jpg
    this.extname  = path.extname(this.name);
};

cache.prototype.exist = function()
{
    try
    {
        fs.accessSync(this.path, fs.R_OK | fs.W_OK);
        return true;
    }
    catch (err)
    {
    }
};

cache.prototype.delete = function()
{
    try
    {
        fs.unlinkSync(this.path);
        console.log('cache deleted [' + this.path + ']');
    }
    catch (err)
    {
        console.log(err);
    }
};

cache.prototype.save = function(buffer)
{
    try
    {
        fs.writeFileSync(this.path, buffer);
        hits[this.name] = 0;
    }
    catch (err)
    {
        console.log(err);
    }
};

cache.prototype.hits = function()
{
    return hits[this.name] ? hits[this.name] : 0;
};

cache.prototype.hit = function()
{
    hits[this.name] = this.hits() + 1;
};

cache.list = function(dir)
{
    var ret = [];

    try
    {
        for (name of fs.readdirSync(dir))
        {
            ret.push(new cache(decodeURIComponent(name), dir));
        }
    }
    catch (err)
    {
        console.log(err);
    }

    return ret;
};

cache.clear = function(dir)
{
    for (c of cache.list(dir))
    {
        c.delete();
    }
    hits = {};
};