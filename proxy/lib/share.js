var fs      = require('fs');
var path    = require('path');
var url     = require('url');
var request = require('request');
var rimraf  = require('rimraf');

/*========== cache ==========*/
module.exports.cache = cache;

function cache(cache_url)
{
    this.url = url.parse(cache_url);

    this.localpath
}

cache.dir = path.resolve(__dirname + '/../cache/');

cache.get() = function()
{

}

cache.prototype.exist = function()
{
    
};

cache.prototype.delete = function()
{

};


/*========== fetches ==========*/
module.exports.fetches = {};

module.exports.fetch_times = function(filename, val)
{
    if (this.fetches[filename] === undefined)
    {
        this.fetches[filename] = 0;
    }

    if (val === undefined)
    {
        return this.fetches[filename];
    }
    else
    {
        this.fetches[filename] = val;
    }
}

module.exports.fetch_times_inc = function(filename)
{
    this.fetch_times(filename, this.fetch_times(filename) + 1);
}


/*========== cache ==========*/
module.exports.cache_path = path.resolve(__dirname + '/../cache/');

module.exports.caches = function()
{
    try
    {
        return fs.readdirSync(this.cache_path);
    }
    catch(err)
    {
        this.log(err);
    }
};

module.exports.cache_save = function(filename, buffer, callback)
{            
    fs.writeFile(path.join(this.cache_path, filename), buffer, function (err)
    {
        callback(err);
    });
}

module.exports.cache_delete = function(file)
{
    file = path.join(this.cache_path, file);

    try
    {
        fs.unlinkSync(file);
        this.log('file deleted : ' + file);
    }
    catch (err)
    {
        this.log(err);
    }
}

/*========== delay ==========*/
module.exports.delays = {};

/*========== proxy ==========*/
module.exports.proxies = {};

/*========== server ==========*/
module.exports.servers = {};

/*========== log ==========*/
module.exports.log = function(str)
{
    console.log('[' + (new Date()).toLocaleString() + '] ' + str);
};