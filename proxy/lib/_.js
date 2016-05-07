const CONF_PATH         = 'conf.json';
const CONF_DEFAULT_PATH = 'conf.default.json';

var fs      = require('fs');
var path    = require('path');
var url     = require('url');
var request = require('request');
var track   = require('./track.js');
var cache   = require('./cache.js');

var _ = module.exports = {};

_.track        = undefined;
_.filePath     = undefined;
_.fetchTimeout = undefined;
_.proxies      = [];
_.servers      = [];

_.load = function()
{
    var conf;

    try
    {
        conf = JSON.parse(fs.readFileSync(CONF_PATH, 'utf-8'));
    }
    catch (err)
    {
        console.log(err);
        console.log('load from conf.json failed, try conf.default.json');

        try
        {
            conf = JSON.parse(fs.readFileSync(CONF_DEFAULT_PATH, 'utf-8'));
            fs.createReadStream(CONF_DEFAULT_PATH).pipe(fs.createWriteStream(CONF_PATH));
        }
        catch (err)
        {
            console.log(err);
            console.log('load from conf.default.json also failed ╮(╯-╰)╭');
            process.exit(0);
        }
    }

    // load configurations

    _.filePath = conf.filePath;

    _.fetchTimeout = conf.fetchTimeout;

    _.track = track.fromJSON
    (
        conf.track,

        () =>
        {
            var ret    = {};
            var caches = cache.listSync(_.filePath);

            for (c of caches)
            {
                ret[c.url] = c.hits();
            }

            return ret;
        },

        function(error, data)
        {
            if (error)
            {
                this.active = false;
                _.proxies = {};
                _.servers = {};
            }
            else
            {
                this.active = true;
                _.proxies = data.proxies;
                _.servers = data.servers;
            }
        }
    );
}

_.save = function()
{
    try
    {
        var clone = _;
        delete clone.proxies;
        delete clone.servers;
        fs.writeFileSync(CONF_PATH, JSON.stringify(clone, null, 4), 'utf8');
    }
    catch (err)
    {
        console.log(err);
        console.log('save conf-info to conf.json failed');
    }
}

_.load();