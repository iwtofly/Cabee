var ipaddr = require('ipaddr.js');

let Rules = module.exports = function(conf)
{
    this.list = [];
    for (cidr in conf)
    {
        this.add(cidr, conf[cidr]);
    }
};

Rules.prototype.add = function(cidr, time)
{
    this.list.push(new Rule(cidr, time));
};

Rules.prototype.all = function()
{
    return this.list;
};

Rules.prototype.clear = function(cidr, time)
{
    this.list = [];
};

Rules.prototype.match = function(ip)
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