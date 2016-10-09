var ipaddr = require('ipaddr.js');

let mod = module.exports = function()
{
};

mod.format = (ip) =>
{
    if (ip == 'localhost') return '127.0.0.1';

    let res = ipaddr.parse(ip);
    if (res.isIPv4MappedAddress())
    {
        return res.toIPv4Address().toString();
    }
    return res.toString();
};