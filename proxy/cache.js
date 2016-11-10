let express = require('express');
let path    = require('path');
let request = require('request');
let util    = require('util');
let Ip      = require('_/ip');
let File    = require('_/file');
let Cache   = require('_/cache');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.router = express.Router();
    this.dir = app.dir;

    this.init();
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
        console.log(this.list());
    });
    
    router.get(
    [
        '/delete/',
        '/delete/:ip',
        '/delete/:ip/:port',
        '/delete/:ip/:port/:video',
        '/delete/:ip/:port/:video/:piece'
    ],
    (req, res) =>
    {
        let folder = path.join
        (
            dir,
            req.params.ip    || '',
            req.params.port  || '',
            req.params.video || '',
            req.params.piece || ''
        );
        res.json(File.rm(folder) ? 'ok' : 'error');
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
        let cache = new Cache
        (
            req.params.ip,
            req.params.port,
            req.params.video,
            req.params.piece
        );
        let log = (...args) =>
        {
            app.log('[cache] [%s|%s]=>[%s] %s', src_ip, src_pos, cache.url(), util.format(...args));
        };

        let delay = app.delay.match(req.params.pos);
        app.count.req(cache);

        // try get file from local cache
        log('begin');
        app.gui.emit('offer_bgn',
                      src_ip,
                      src_pos,
                      cache.toString());

        if (File.exist(cache.path(dir)))
        {
            log('cache found');
            setTimeout(() =>
            {
                log('cache sent with delay [%s]ms', delay);
                app.gui.emit('offer_end',
                              src_ip,
                              src_pos,
                              cache.toString(),
                              delay,
                              'ok');
                res.sendFile(cache.path(dir));
            },
            delay);
            app.count.hit(cache);
            return;
        }
        log('cache not found');

        // fetch forbidden
        if (!app.conf.cache.fetch)
        {
            log('no local cache & fetch is forbidden');
            app.gui.emit('offer_end',
                          src_ip,
                          src_pos,
                          cache.toString(),
                          0,
                          'local cache not exist');

            res.status(404).end('no cache & fetch is forbidden');
            return;
        }

        // fetch file directly from source server
        log('try fetch from source');
        app.gui.emit('fetch_bgn',
                      cache.ip,
                      cache.port,
                      cache.toString());

        let tick = Date.now();
        cache.fetch(app.conf.pos, (err, response, body) =>
        {
            if (err || response.statusCode != 200)
            {
                log('fetch failed');
                app.gui.emit('fetch_end',
                              cache.ip,
                              cache.port,
                              cache.toString(),
                              Date.now() - tick,
                              'HTTP failed');
                res.status(404).end('cache fetch failed');
            }
            else
            {
                log('fetch succeeded');
                app.gui.emit('fetch_end',
                              cache.ip,
                              cache.port,
                              cache.toString(),
                              Date.now() - tick,
                              'ok');

                if (app.conf.cache.save && File.save(cache.path(dir), body))
                {
                    log('save to [' + cache.path(dir) + ']');
                    setTimeout(() =>
                    {
                        log('cache sent with delay [%s]ms', delay);
                        app.gui.emit('offer_end',
                                      src_ip,
                                      src_pos,
                                      cache.toString(),
                                      delay,
                                      'ok');

                        res.sendFile(cache.path(dir));
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
                                      cache.toString(),
                                      delay,
                                      'ok');

                        res.send(body);
                    },
                    delay);
                }
            }
        });
    });
};

mod.prototype.list = function()
{
    list = {};
    for (ip of File.folders(this.dir))
    {
        list[ip] = {};
        for (port of File.folders(path.join(this.dir, ip)))
        {
            list[ip][port] = {};
            for (video of File.folders(path.join(this.dir, ip, port)))
            {
                list[ip][port][video] = File.files(path.join(this.dir, ip, port, video));
            }
        }
    }
    return list;
};