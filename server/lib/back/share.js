var fs     = require('fs');
var path   = require('path');
var ipaddr = require('ipaddr.js');

module.exports.track_url      = 'http://127.0.0.1:12346/server/report';
module.exports.track_interval = 1000;
module.exports.track_active   = false;

module.exports.delay_list =
[
    {
        'addr' : '0.0.0.0',
        'mask' : '0.0.0.0',
        'time' : 100
    },
    {
        'addr' : '127.0.0.1',
        'mask' : '255.255.255.255',
        'time' : 0
    }
];

module.exports.delay_time = function(ip)
{
    var time = 0;

    if (ipaddr.isValid(ip))
    {
        var addr = ipaddr.process(ip);

        if (addr.kind() == 'ipv4')
        {
            for (item of this.delay_list)
            {
                if (addr.match(ipaddr.parse(item.addr), ipaddr.IPv4.parse(item.mask).prefixLengthFromSubnetMask()))
                {
                    time = item.time;
                }
            }
        } 
    }

    return time;
};

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

module.exports.upload_delete = function(file)
{
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

module.exports.log = function(str)
{
    console.log('[' + (new Date()).toLocaleString() + '] ' + str);
}