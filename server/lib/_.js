var path   = require('path');
var ipaddr = require('ipaddr.js');
var file   = require('./file.js');
var delay  = require('./delay.js');
var track  = require('./track.js');

var _ = module.exports = {};

_.delays =
[
    new delay('0.0.0.0/0', 100),
    new delay('::/0', 100)
];

_.mediaPath = path.join(__dirname, '/../media/');

_.track = new track
(
    'http://127.0.0.1:12346/server/check',
    1000,
    1000,
    function()
    {
        return file.listSync(_.mediaPath);
    },
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

_.hits = {};