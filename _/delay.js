var ipaddr = require('ipaddr.js');

module.exports = Delay;

function Delay()
{
    this.list = [];
};

Delay.prototype.add = function(cidr, time)
{
    this.list.push(new Rule(cidr, time));
};

Delay.prototype.all = function()
{
    return this.list;
};

Delay.prototype.clear = function(cidr, time)
{
    this.list = [];
};

Delay.prototype.match = function(ip)
{
    for (rule of this.list)
    {
        if (rule.match(ip))
            return rule.time;
    }
    return 0;
};

function Rule(cidr, time)
{
    this.cidr = cidr;
    this.time = time;
    this.kind = ipaddr.parse(cidr.substr(0, cidr.indexOf('/'))).kind();
};

Rule.prototype.match = function(ip)
{
    ip = ipaddr.parse(ip);
    return ip.kind() == this.kind && ip.match(ipaddr.parseCIDR(this.cidr));
};

Rule.prototype.toString = function()
{
    return '[rule|' + this.cidr + '|' + this.time + 'ms]';
};