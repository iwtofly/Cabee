var ipaddr = require('ipaddr.js');

module.exports = delay;

function delay(cidr, time)
{
    this.cidr = cidr;
    this.time = time;
    this.kind = ipaddr.parse(cidr.substr(0, cidr.indexOf('/'))).kind();
};

delay.fromJSON = function(json)
{
    return new delay(json.cidr, json.time);
}

delay.prototype.subnet = function(ip)
{
    ip = ipaddr.parse(ip);
    return ip.kind() == this.kind && ip.match(ipaddr.parseCIDR(this.cidr));
};

delay.prototype.toString = function()
{
    return 'cidr[' + this.cidr + '] time[' + this.time + ']';
};

delay.match = function(ip, list)
{
    var time = 0;

    for (d of list)
    {
        if (d.subnet(ip))
        {
            time = d.time;
        }
    }

    return time;
};