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
};

track.fromJSON = function(json, post, callback)
{
    return new track(json.url, json.interval, json.timeout, post, callback);
}

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
        if (error)
        {
            this.callback(error);
        }
        else if (response.statusCode != 200)
        {
            this.callback(new Error(response.statusMessage));
        }
        else if (body === undefined)
        {
            this.callback(new Error('no data returned'));
        }
        else
        {
            this.callback(null, body);
        }

        setTimeout(this.check.bind(this), this.interval);
    });
};