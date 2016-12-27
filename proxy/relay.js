let express = require('express'); 
let path    = require('path');
let request = require('request');
let multer  = require('multer');
let util    = require('util');
let Ip      = require('_/ip');
let File    = require('_/file');
let Pos     = require('_/pos');
let Slice   = require('./model/slice');
let Pull    = require('./pull');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.router = express.Router();

    this.init();
};

// 
mod.prototype.init = function()
{
    let app    = this.app;
    let dir    = this.app.dir;
    let router = this.router;

    // original url of target is [http://$ip:$port/video/$video/$piece]
    router.get(
    [
        '/:video/:piece',
        '/:video/:piece/:pos'
    ],
    (req, res, next) =>
    {
        // /video/time is a special URL of server
        if (req.params.video == 'time')
        {
            next();
            return;
        }

        // collect info
        let src_ip  = Ip.format(req.ip);
        let src_pos = req.params.pos;
        // let host = req.get('shit');
        let host = req.get('host');
        let split = host.indexOf(':');
        let slice = null;
        if (split != -1)
        {
            slice = new Slice
            (
                host.substr(0, split),
                host.substr(host.indexOf(':') + 1),
                req.params.video,
                req.params.piece
            );
        }
        else
        {
            slice = new Slice
            (
                host,
                80,
                req.params.video,
                req.params.piece
            );
        }

        let log = (...args) =>
        {
            app.log('[relay] [%s|%s]=>[%s] %s', src_ip, src_pos, slice.url(), util.format(...args));
        };
        let delay = app.delay.match(src_pos);
        app.count.req(slice);

        // try get file from local cache
        log('begin');
        app.gui.broadcast('offer_bgn',
                          src_ip,
                          src_pos,
                          slice.toString());
        
        if (File.exist(slice.path(dir)))
        {
            log('cache found');
            setTimeout(() =>
            {
                log('cache sent with delay ' + delay);
                app.gui.broadcast('offer_end',
                                  src_ip,
                                  src_pos,
                                  slice.toString(),
                                  delay,
                                  'ok');
                res.sendFile(slice.path(dir));
            },
            delay);
            app.count.hit(slice);
            return;
        }
        log('cache not found, try relay from other proxies');

        // try get file from other proxies
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
                app.gui.broadcast('ping_bgn',
                                  proxy.ip,
                                  proxy.conf.port);
                let tick = Date.now();

                // begin ping
                proxy.ping(app.conf.pos, (err, response, body) =>
                {
                    if (err || response.statusCode != 200)
                    {
                        log('ping [%s] failed', proxy.toString());
                        app.gui.broadcast('ping_end',
                                          proxy.ip,
                                          proxy.conf.port,
                                          'HTTP failed',
                                          Date.now() - tick);
                    }
                    else
                    {
                        log('ping [%s] succeeded in [%s]ms', proxy.toString(), body);
                        app.gui.broadcast('ping_end',
                                          proxy.ip,
                                          proxy.conf.port,
                                          'ok',
                                          body);

                        // no other pinged proxy has returned yet, so we are the chosen one :D
                        if (!chosen)
                        {
                            chosen = true;
                            log('[%s] is chosen for relaying cache', proxy.toString());
                            app.gui.broadcast('fetch_bgn',
                                              proxy.ip,
                                              proxy.conf.port,
                                              slice.toString());

                            // fetch from this proxy
                            let tick = Date.now();
                            proxy.relay(slice, app.conf.pos, (err, response, body) =>
                            {
                                if (err || response.statusCode != 200)
                                {
                                    log('relay failed');
                                    app.gui.broadcast('fetch_end',
                                                      proxy.ip,
                                                      proxy.conf.port,
                                                      slice.toString(),
                                                      'HTTP failed',
                                                      Date.now() - tick);
                                }
                                else
                                {
                                    log('relay succeeded');
                                    app.gui.broadcast('fetch_end',
                                                      proxy.ip,
                                                      proxy.conf.port,
                                                      slice.toString(),
                                                      'ok',
                                                      Date.now() - tick);

                                    if (app.conf.relay.save && File.save(slice.path(dir), body))
                                    {
                                        log('save to [' + slice.path(dir) + ']');
                                        setTimeout(() =>
                                        {
                                            log('cache sent with delay [%s]ms', delay);
                                            app.gui.broadcast('offer_end',
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
                                            app.gui.broadcast('offer_end',
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

                                // get other slices
                                Pull(app, (...args) => app.log('[pull] ', util.format(...args)), slice);
                            });
                        }
                    }
                });
            }
        }

        // no proxy has cache, directly fetch from source
        if (!exist)
        {
            log('no proxy has cache');

            // fetch forbidden
            if (!app.conf.relay.fetch)
            {
                log('no cache & fetch is forbidden');
                app.gui.broadcast('offer_end',
                                  src_ip,
                                  src_pos,
                                  slice.toString(),
                                  0,
                                  'no cache & fetch is forbidden');
                res.status(404).end('no cache & fetch is forbidden');
            }

            log('try fetch from source');
            app.gui.broadcast('fetch_bgn',
                              slice.ip,
                              slice.port,
                              slice.toString());
            let tick = Date.now();

            // fetch file directly from source server
            slice.fetch(app.conf.pos, (err, response, body) =>
            {
                if (err || response.statusCode != 200)
                {
                    log('fetch failed with [%s]', err);
                    app.gui.broadcast('fetch_end',
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
                    app.gui.broadcast('fetch_end',
                                      slice.ip,
                                      slice.port,
                                      slice.toString(),
                                      Date.now() - tick,
                                      'ok');

                    if (app.conf.relay.save && File.save(slice.path(dir), body))
                    {
                        log('save to [' + slice.path(dir) + ']');
                        setTimeout(() =>
                        {
                            log('cache sent with delay ' + delay);
                            app.gui.broadcast('offer_end',
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
                            log('cache sent with delay ' + delay);
                            app.gui.broadcast('offer_end',
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
    });
};
