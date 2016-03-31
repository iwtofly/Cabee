var url = require('url');

var _ = module.exports = {};

// {
//     '192.168.0.1' :
//     {
//         'http://10.1.1.1/kantai-1.jpg' : 10,
//         ...
//     },
//     ...
// }
_.proxies = {};

// {
//     '10.10.1.1':
//     {
//         '/kantai-1.jpg' : 30,
//         ...
//     },
//     ...
// }
_.hits = function(server)
{
    var ret = {};

    for (proxy in _.proxies)
    {
        for (file in _.proxies[proxy])
        {
            file = url.parse(file);

            if (ret[file.host] === undefined)
            {
                ret[file.host] = {};
            }

            if (ret[file.host][file.pathname] === undefined)
            {
                ret[file.host][file.pathname] = 0;
            }

            ret[file.host][file.pathname] += _.proxies[proxy][file.href];
        }
    }

    return server ? ret[server] : ret;
};

// {
//     '10.1.1.1' :
//     [
//         'kantai-1.jpg',
//         ...
//     ],
//     ...
// }
_.servers = {};