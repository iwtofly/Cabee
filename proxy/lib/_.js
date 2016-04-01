var fs      = require('fs');
var path    = require('path');
var url     = require('url');
var request = require('request');
var track   = require('./track.js');
var cache   = require('./cache.js');

var _ = module.exports = {};

_.cachePath = path.resolve(__dirname + '/../cache/');

_.fetchTimeout = 1000;

_.proxies = [];

_.servers = [];

_.track = new track
(
    'http://127.0.0.1:12346/proxy/check',
    1000,
    1000,
    function()
    {
        var caches = cache.list(_.cachePath);

        var ret = {};

        for (c of caches)
        {
            ret[c.url] = c.hits();
        }

        return ret;
    },
    function(err, data)
    {
        if (err)
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