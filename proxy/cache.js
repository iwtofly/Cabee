let express = require('express');
let path    = require('path');
let request = require('request');
let util    = require('util');
let Ip      = require('_/ip');
let File    = require('_/file');
let Slice   = require('./model/slice');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.router = express.Router();
    this.dir    = app.dir;

    this.init();
};

mod.prototype.list = function()
{
    list = {};
    for (let ip of File.folders(this.dir))
    {
        list[ip] = {};
        for (let port of File.folders(path.join(this.dir, ip)))
        {
            list[ip][port] = {};
            for (let video of File.folders(path.join(this.dir, ip, port)))
            {
                list[ip][port][video] = File.files(path.join(this.dir, ip, port, video));
            }
        }
    }
    return list;
};

// this function is called by a peer proxy who assume that this proxy has a cache
// but this may not be true, so first we check the existence of requested cache
// if it does exist, send it. otherwise, we have to fetch it from the source server
// if succeed, send it and save it to local storage. if fail, send a 404
mod.prototype.init = function()
{
    let app    = this.app;
    let dir    = this.dir;
    let router = this.router;

    router.get('/', (req, res) =>
    {
        res.render('main.j2', {'list' : this.list()});
    });

    // original url of target is [http://$ip:$port/video/$video/$piece]
    router.get(
    [
        '/:ip/:port/:video/:piece',
        '/:ip/:port/:video/:piece/:pos'
    ],
    (req, res) =>
    {
        // collect info
        let src_ip  = Ip.format(req.ip);
        let src_pos = req.params.pos;
        let slice = new Slice
        (
            req.params.ip,
            req.params.port,
            req.params.video,
            req.params.piece
        );
        let log = (...args) =>
        {
            app.log('[cache] [%s|%s]=>[%s] %s', src_ip, src_pos, slice.url(), util.format(...args));
        };

        let delay = app.delay.match(req.params.pos);
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
            app.count.hit(slice);
            return;
        }
        log('cache not found');

        // fetch forbidden
        if (!app.conf.cache.fetch)
        {
            log('no local cache & fetch is forbidden');
            app.gui.broadcast('offer_end',
                              src_ip,
                              src_pos,
                              slice.toString(),
                              0,
                              'local cache not exist');

            res.status(404).end('no cache & fetch is forbidden');
            return;
        }

        // fetch file directly from source server
        log('try fetch from source');
        app.gui.broadcast('fetch_bgn',
                          slice.ip,
                          slice.port,
                          slice.toString());

        let tick = Date.now();
        slice.fetch(app.conf.pos, (err, response, body) =>
        {
            if (err || response.statusCode != 200)
            {
                log('fetch failed');
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

                if (app.conf.cache.save && File.save(slice.path(dir), body))
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
        });
    });

    router.delete(
    [
        '/',
        '/:ip',
        '/:ip/:port',
        '/:ip/:port/:video',
        '/:ip/:port/:video/:piece'
    ],
    (req, res) =>
    {
        let target = path.join
        (
            dir,
            req.params.ip    || '',
            req.params.port  || '',
            req.params.video || '',
            req.params.piece || ''
        );
        let status = File.rm(target) ? 'ok' : 'error';
        app.log('delete [%s] %s', target, status);
        res.json(status);
        app.refresh();
    });
};