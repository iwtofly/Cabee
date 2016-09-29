$(document).ready(() =>
{
    window.track = new Track();

    window.track.io.on('connect', () =>
    {
        console.log('connect to track');
    });

    window.track.io.on('disconnect', () =>
    {
        console.log('disconnect to track');
    });

    window.track.io.on('notify', (servers, proxies) =>
    {
        let core =
        {
            servers : [],
            proxies : []
        };

        // push servers
        for (server of servers)
        {
            server.type = 'server';
            core.servers.push(server);
        }

        // push proxies
        map = {};
        for (proxy of proxies)
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
                core.proxies.push(map[key]);
            }
        }

        console.log(core);

        // draw test
        window.painter.tree(core);
        setTimeout(()=>{
            window.painter.msg(core.proxies[0])
        },1000);
        // setTimeout(()=>{
        //     window.painter.linkArrow(core.proxies[0],core.proxies[1],"ask","text msg")
        // },4000);

        
    });  
});