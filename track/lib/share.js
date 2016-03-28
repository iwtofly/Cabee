/*========== proxy ==========*/
module.exports.proxies =
{
    '192.168.0.1' :
    {
        'delay' :
        {
            '10.1.1.1' : 100,
            '10.1.1.2' : 500
        },
        'cache' :
        {
            '10.1.1.1' :
            {
                '/upload/1.jpg' : 1
            },
            '10.1.1.2' :
            {
                '/upload/3.jpg' : 3
            },
        }
    },
    '192.168.0.2' :
    {
        'delay' :
        {
            '10.1.1.1' : 500,
            '10.1.1.2' : 100
        },
        'cache' :
        {
            '10.1.1.1' :
            {
                '/upload/1.jpg' : 1,
                '/upload/2.jpg' : 2
            },
            '10.1.1.2' :
            {
                '/upload/3.jpg' : 1,
                '/upload/4.jpg' : 2
            }
        }
    }
};

// [proxy, ...]
module.exports.proxy_addr = function()
{
    var ret = [];

    for (proxy in this.proxies)
    {
        ret.push(proxy);
    }

    return ret;
}

// {server : {proxy : delay}, ...}
module.exports.proxy_delay = function(server)
{
    var ret = {};

    if (server === undefined)
    {
        for (proxy in this.proxies)
        {
            for (server in this.proxies[proxy].delay)
            {
                if (ret[server] === undefined)
                {
                    ret[server] = {};
                }
                ret[server][proxy] = this.proxies[proxy].delay[server];
            }
        }
    }
    else
    {
        for (proxy in this.proxies)
        {
            if (this.proxies[proxy].delay[req.params.server] !== undefined)
            {
                ret[proxy] = this.proxies[proxy].delay[req.params.server];
            }
        }
        res.json(ret);
    }

    return ret;
};

// {server : {file : [proxy, ...], ...}, ...}
module.exports.proxy_cache = function(server)
{
    var ret = {};

    if (server === undefined)
    {
        for (proxy in this.proxies)
        {
            for (server in this.proxies[proxy].cache)
            {
                if (ret[server] === undefined)
                {
                    ret[server] = {};
                }

                for (file in this.proxies[proxy].cache[server])
                {
                    if (ret[server][file] === undefined)
                    {
                        ret[server][file] = [];
                    }
                    ret[server][file].push(proxy);
                }
            }
        }
    }
    else
    {
        for (proxy in this.proxies)
        {
            if (this.proxies[proxy].cache[req.params.server] !== undefined)
            {
                for (file in this.proxies[proxy].cache[req.params.server])
                {
                    if (ret[file] === undefined)
                    {
                        ret[file] = [];
                    }
                    ret[file].push(proxy);
                }
            }
        }
    }

    return ret;
};

/*========== server ==========*/
module.exports.servers =
{
    '10.1.1.1' :
    [
        '/upload/1.jpg',
        '/upload/2.jpg'
    ],
    '10.1.1.2' :
    [
        '/upload/3.jpg',
        '/upload/4.jpg'
    ]
};

/*========== log ==========*/
module.exports.log = function(str)
{
    console.log('[' + (new Date()).toLocaleString() + '] ' + str);
};