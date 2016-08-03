const CONF_PATH         = 'conf.json';
const CONF_DEFAULT_PATH = 'conf.default.json';

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

    for (d of conf.delays)
    {
        _.delays.push(delay.fromJSON(d));
    }

    _.filePath = conf.filePath;
    
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