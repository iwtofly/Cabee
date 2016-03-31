var request = require('request');

module.exports = proxy;

function proxy(ip, delays, caches)
{
    this.ip     = ip;
    this.delays = delays;
    this.caches = caches;
};

proxy.prototype.hasCache = function(name)
{
    return this.caches[name];
};

proxy.prototype.fetch = function(name, timeout, callback)
{
    request(
    {
        'url'      : 'http://' + this.ip + ':12347/fetch/' + encodeURIComponent(name),
        'encoding' : null,
        'timeout'  : timeout
    },
    (error, response, body) =>
    {
        callback(error, response, body);
    });
};

proxy.prototype.toJSON = function()
{
    return JSON.stringify(
    {
        'ip' : this.ip,
        'delays'
    });
};

proxy.fromJSON = function(json)
{

};