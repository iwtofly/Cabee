let File    = require('_/file');
let Pos     = require('_/pos');

let mod = module.exports = function()
{
};

mod.from_server = (app, src_ip, src_pos, log, slice, delay, save, res) =>
{
    let dir = app.dir;

    // fetch file directly from source server
    log('try fetch from source');
    app.gui.emit('fetch_bgn',
                  slice.ip,
                  slice.port,
                  slice.toString());


    let tick = Date.now();
    slice.fetch(app.conf.pos, (err, response, body) =>
    {
        if (err || response.statusCode != 200)
        {
            log('fetch failed');
            app.gui.emit('fetch_end',
                          slice.ip,
                          slice.port,
                          slice.toString(),
                          Date.now() - tick,
                          'HTTP failed');
            res.status(404).end('cache fetch failed');
        }
        else
        {
            log('fetch succeeded');
            app.gui.emit('fetch_end',
                          slice.ip,
                          slice.port,
                          slice.toString(),
                          Date.now() - tick,
                          'ok');

            if (save && File.save(slice.path(dir), body))
            {
                log('save to [' + slice.path(dir) + ']');
                setTimeout(() =>
                {
                    log('cache sent with delay [%s]ms', delay);
                    app.gui.emit('offer_end',
                                  src_ip,
                                  src_pos,
                                  slice.toString(),
                                  delay,
                                  'ok');

                    res.sendFile(slice.path(dir));
                },
                delay);
                app.refresh();
            }
            else
            {
                setTimeout(() =>
                {
                    res.set('content-type', response.headers['content-type']);
                    res.set('content-length', response.headers['content-length']);

                    log('cache sent with delay [%s]ms', delay);
                    app.gui.emit('offer_end',
                                  src_ip,
                                  src_pos,
                                  slice.toString(),
                                  delay,
                                  'ok');

                    res.send(body);
                },
                delay);
            }
        }
    });

};

mod.from_proxy = (app, src_ip, src_pos, log, slice, delay, save, res, on_not_exist) =>
{
    let exist = false;
    let chosen = false;

    for (let proxy of app.proxies)
    {
        if (proxy.has(slice) && (
            app.conf.relay.source.sub && Pos.sub(proxy.conf.pos, app.conf.pos) ||
            app.conf.relay.source.peer && Pos.peer(proxy.conf.pos, app.conf.pos) ||
            app.conf.relay.source.super && Pos.super(proxy.conf.pos, app.conf.pos)))
        {
            exist = true;
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

                                if (app.conf.relay.save && File.save(slice.path(dir), body))
                                {
                                    log('save to [' + slice.path(dir) + ']');
                                    setTimeout(() =>
                                    {
                                        log('cache sent with delay [%s]ms', delay);
                                        app.gui.emit('offer_end',
                                                      src_ip,
                                                      src_pos,
                                                      slice.toString(),
                                                      delay,
                                                      'ok');

                                        res.sendFile(slice.path(dir));
                                    },
                                    delay);
                                    app.refresh();
                                }
                                else
                                {
                                    setTimeout(() =>
                                    {
                                        res.set('content-type', response.headers['content-type']);
                                        res.set('content-length', response.headers['content-length']);
                                        log('cache sent with delay [%s]ms', delay);
                                        app.gui.emit('offer_end',
                                                      src_ip,
                                                      src_pos,
                                                      slice.toString(),
                                                      delay,
                                                      'ok');
                                        res.send(body);
                                    },
                                    delay);
                                }
                            }
                        });
                    }
                }
            });
        }
    }

    if (!exist)
        on_not_exist();
};