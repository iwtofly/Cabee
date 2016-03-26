var fs   = require('fs');
var path = require('path');

module.exports.track_ip = '192.168.1.1';

module.exports.delay_list =
[
    {
        'addr' : '0.0.0.0',
        'mask' : '0.0.0.0',
        'time' : 200
    }
];

module.exports.upload_path = path.resolve(__dirname + '/../../upload/');

module.exports.upload_list = function()
{
    try
    {
        return fs.readdirSync(this.upload_path);
    }
    catch(err)
    {
        this.log(err);
    }
};

module.exports.log = function(str)
{
    console.log('[' + (new Date()).toLocaleString() + '] ' + str);
}