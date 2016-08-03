var fs      = require('fs');
var url     = require('url');
var path    = require('path');
var mkdirp  = require('mkdirp');
var request = require('request');

module.exports = cache;

function cache(fileURL, dir)
{
    var info = url.parse(fileURL);

    // http://10.1.1.1/kantai-1.jpg
    this.url      = fileURL;
    // /kantai-1.jpg
    this.name     = info.pathname;
    // http%3A%2F%2F10.1.1.1%2Fkantai-1.jpg
    this.filename = encodeURIComponent(this.url);
    // /http%253A%252F%252F10.1.1.1%252Fkantai-1.jpg
    this.href     = '/' + encodeURIComponent(this.filename);
    // cache
    this.dir      = dir;
    // cache\http%3A%2F%2F10.1.1.1%2Fkantai-1.jpg
    this.path     = path.join(dir, this.filename);
    // wwwroot/upload/kantai-1.jpg
    this.pathAbs  = path.resolve(this.path);
    // .jpg
    this.extname  = path.extname(this.name);
};

cache.prototype.existSync = function()
{
    try
    {
        fs.accessSync(this.path, fs.R_OK | fs.W_OK);
        return true;
    }
    catch (err) {}
};

var hits = {};

cache.prototype.hits = function()
{
    return hits[this.url] ? hits[this.url] : 0;
};

cache.prototype.hit = function()
{
    hits[this.url] = this.hits() + 1;
};

cache.prototype.deleteSync = function()
{
    try
    {
        fs.unlinkSync(this.path);
        console.log('cache delete success [' + this.path + ']');
        return true;
    }
    catch (err)
    {
        console.log(err);
        console.log('cache delete fail [' + this.path + ']');
    }
};

cache.prototype.saveSync = function(buffer)
{
    try
    {
        fs.writeFileSync(this.path, buffer);
        hits[this.url] = 0;
        console.log('cache save success [' + this.path + ']');
        return true;
    }
    catch (err)
    {
        console.log(err);
        console.log('cache save fail [' + this.path + ']');
    }
};

cache.prototype.pull = function(timeout, cb)
{
    request(
    {
        'url'      : this.url,
        'encoding' : null,
        'timeout'  : timeout
    },
    (error, response, body) =>
    {
        var err = error ? error :
                  response.statusCode != 200 ? response.statusMessage :
                  this.saveSync(body) ? undefined : new Error('cache save fail') ;

        if (cb) cb(err);
    });
};

cache.listSync = function(dir)
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
        mkdirp(dir, (err) =>
        {
            if (err) console.log(err);
        });
    }

    return ret;
};

cache.clearSync = function(dir)
{
    for (c of cache.listSync(dir))
    {
        c.deleteSync();
    }
    hits = {};
};