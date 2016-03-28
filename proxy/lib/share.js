var fs   = require('fs');
var path = require('path');

/*========== track ==========*/
module.exports.track_url      = 'http://127.0.0.1:12346/proxy/check';
module.exports.track_interval = 1000;
module.exports.track_active   = false;

/*========== cache ==========*/
module.exports.cache_path = path.resolve(__dirname + '/../cache/');

var cache_time = {};

module.exports.cache_list = function()
{
    try
    {
        var files = fs.readdirSync(this.cache_path);
        var ret = {};

        for (file of files)
        {
            ret[file] = cache_time[file];
        }

        return ret;
    }
    catch(err)
    {
        this.log(err);
    }
};

module.exports.cache_delete = function(file)
{
    try
    {
        delete this.cache_time[file];
        file = path.join(this.cache_path, file);
        fs.unlinkSync(file);
        this.log('file deleted : ' + file);
    }
    catch (err)
    {
        this.log(err);
    }
}

/*========== delay ==========*/
module.exports.delays         = {};
module.exports.delay_interval = 1000;

/*========== proxy ==========*/
module.exports.proxies  = {};

/*========== server ==========*/
module.exports.servers  = {'127.0.0.1' : 100};


/*========== log ==========*/
module.exports.log = function(str)
{
    console.log('[' + (new Date()).toLocaleString() + '] ' + str);
};