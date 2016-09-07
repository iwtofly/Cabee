$(document).ready(() =>
{
    let io_track = io('/gui');

    io_track.on('connect', () =>
    {
        console.log('connect to track');
    });

    io_track.on('disconnect', () =>
    {
        console.log('disconnect to track');
    });

    io_track.on('update', (data) =>
    {
        let core =
        {
            type: 'core',
            nodes: []
        };

        // push track
        data.track.type = 'track';
        core.nodes.push(data.track);

        // push servers
        for (server of data.server)
        {
            server.type = 'server';
            core.nodes.push(server);
        }

        console.log(data.proxy);

        // push proxies
        map = {};
        for (proxy of data.proxy)
        {
            map[proxy.pos] = proxy;
        }
        for (key in map)
        {
            if (key.length > 1)
            {
                parent = map[key.slice(0, -1)];
                parent.nodes = parent.nodes || [];
                parent.nodes.push(map[key]);
            }
            else
            {
                core.nodes.push(map[key]);
            }
        }

        console.log(core);

        // draw
        // window.painter.tree(core);
    });  
});