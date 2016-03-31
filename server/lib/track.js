var request = require('request');

module.exports = track;

function track(url, interval, timeout, post, callback)
{
    this.url      = url;
    this.interval = interval;
    this.timeout  = timeout;
    this.post     = post;
    this.callback = callback;
    this.active   = false;
    this.auto     = false;
};

track.prototype.check = function()
{
    request(
    {
        'url'     : this.url,
        'method'  : 'POST',
        'body'    : this.post instanceof Function ? this.post() : this.post,
        'timeout' : this.timeout,
        'json'    : true
    },
    (error, response, body) =>
    {
        if (this.callback)
        {
            this.callback(error, response, body);
        }

        if (this.auto)
        {
            setTimeout(this.check.bind(this), this.interval);
        }
    });
};