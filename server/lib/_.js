const CONF_PATH = 'conf.json';

var path   = require('path');
var fs     = require('fs');
var ipaddr = require('ipaddr.js');
var file   = require('./file.js');
var delay  = require('./delay.js');
var track  = require('./track.js');

var _ = module.exports = {};

_.filePath = undefined;
_.track    = undefined;
_.delays   = [];
_.hits     = {};

_.load = function()
{
    try
    {
        var conf = JSON.parse(fs.readFileSync(CONF_PATH, 'utf-8'));

        // delays
        for (d of conf.delays)
        {
            _.delays.push(delay.fromJSON(d));
        }

        // filePath
        _.filePath = conf.filePath;

        // track
        _.track = track.fromJSON
        (
            conf.track,

            () => { return file.listSync(_.filePath); },

            function(error, data)
            {
                if (error)
                {
                    this.active = false;
                    _.hits = {};
                }
                else
                {
                    this.active = true;
                    _.hits = data;
                }
            }
        );

    }
    catch (err)
    {
        console.log(err);
        console.log('load conf-info from conf.json failed');
        process.exit(0);
    }
}

_.save = function()
{
    try
    {
        var clone = _;
        delete clone.hits;
        fs.writeFileSync(CONF_PATH, JSON.stringify(clone, null, 4), 'utf8');
    }
    catch (err)
    {
        console.log(err);
        console.log('save conf-info to conf.json failed');
    }
}

_.load();