let express = require('express');
let util    = require('util');
let Ip      = require('_/ip');
let File    = require('_/file');
let Pos     = require('_/pos');
let Slice   = require('./model/slice');

//
// this module handles the pull when proxy relay a request from user
// when user request slice [shit/1.jpg], and server has shit/[1,2,3,4,5].jpg, we will try to fetch other slices
//
let mod = module.exports = (app, logger, slice) =>
{
    for (let server of app.servers)
    {
        if (server.has(slice))
        {
            let slices = server.rest_of(slice);

            for (let slice of slices)
            {
                let log = (...args) =>
                {
                    logger(slice.url(), util.format(...args));
                };

                let chosen = false;
                
                // try get slice from other proxies
                for (let proxy of app.proxies)
                {
                    if (proxy.has(slice) && (
                        app.conf.relay.source.sub && Pos.sub(proxy.conf.pos, app.conf.pos) ||
                        app.conf.relay.source.peer && Pos.peer(proxy.conf.pos, app.conf.pos) ||
                        app.conf.relay.source.super && Pos.super(proxy.conf.pos, app.conf.pos)))
                    {
                        log('ping [%s]', proxy.toString());
                        app.gui.emit('ping_bgn',
                                      proxy.ip,
                                      proxy.port);
                        let tick = Date.now();

                        // begin ping
                        proxy.ping(app.conf.pos, (err, response, body) =>
                        {
                            if (err || response.statusCode != 200)
                            {
                                log('ping [%s] failed', proxy.toString());
                                app.gui.emit('ping_end',
                                              proxy.ip,
                                              proxy.port,
                                              'HTTP failed',
                                              Date.now() - tick);
                            }
                            else
                            {
                                log('ping [%s] succeeded in [%s]ms', proxy.toString(), body);
                                app.gui.emit('ping_end',
                                              proxy.ip,
                                              proxy.port,
                                              'ok',
                                              body);

                                // no other pinged proxy has returned yet, so we are the chosen one :D
                                if (!chosen)
                                {
                                    chosen = true;
                                    log('[%s] is chosen for fetching cache', proxy.toString());
                                    app.gui.emit('fetch_bgn',
                                                  proxy.ip,
                                                  proxy.port,
                                                  slice.toString());

                                    // fetch from this proxy
                                    let tick = Date.now();
                                    proxy.relay(slice, app.conf.pos, (err, response, body) =>
                                    {
                                        if (err || response.statusCode != 200)
                                        {
                                            log('fetch failed');
                                            app.gui.emit('fetch_end',
                                                          proxy.ip,
                                                          proxy.port,
                                                          slice.toString(),
                                                          'HTTP failed',
                                                          Date.now() - tick);
                                        }
                                        else
                                        {
                                            log('fetch succeeded');
                                            app.gui.emit('fetch_end',
                                                          proxy.ip,
                                                          proxy.port,
                                                          slice.toString(),
                                                          'ok',
                                                          Date.now() - tick);

                                            if (File.save(slice.path(app.dir), body))
                                            {
                                                log('save to [' + slice.path(app.dir) + ']');
                                                app.refresh();
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            }
            // stop get from other servers
            break;
        }
    }
};