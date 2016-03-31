var fs   = require('fs');
var path = require('path');

module.exports = cache;

var hits = {};

function cache(name, dir)
{
    // http://10.1.1.1/kantai-1.jpg
    this.name     = name;
    this.url      = name;
    // E:\Cabee\proxy\cache
    this.dir      = dir;
    // http%3A%2F%2F10.1.1.1%2Fkantai-1.jpg
    this.filename = encodeURIComponent(name);
    // E:\Cabee\proxy\cache\http%3A%2F%2F10.1.1.1%2Fkantai-1.jpg
    this.path     = path.join(dir, this.filename);
    // .jpg
    this.extname  = path.extname(name);
};

cache.prototype.exist = function()
{
    try
    {
        return fs.statSync(this.path).iscache();
    }
    catch (err)
    {
        console.log(err);
    }
};

cache.prototype.delete = function()
{
    try
    {
        fs.unlinkSync(this.path);
        console.log('cache deleted : ' + this.path);
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