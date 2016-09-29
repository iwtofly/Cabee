let express = require('express');
let path    = require('path');
let request = require('request');
let multer  = require('multer');
let util    = require('util');
let File    = require('_/file');
let Cache   = require('_/cache');
let Pos     = require('_/pos');

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
        '/video/:video/:piece',
        '/video/:video/:piece/:pos'
    ],
    (req, res) =>
    {
        // collect info
        let pos  = req.params.pos;
        let host = req.get('shit');
        //let host = req.get('host');

        let cache = new Cache
        (
            host.substr(0, host.indexOf(':')),
            host.substr(host.indexOf(':') + 1),
            req.params.video,
            req.params.piece
        );

        let log = (text) =>
        {
            app.log(util.format('[%s]=>[%s]  %s', req.ip, cache.url(), text));
        };

        let time = app.delay.match(pos);

        // try get file from local cache
        log('begin');
        
        if (File.exist(cache.path(dir)))
        {
            log('cache found');
            setTimeout(() =>
            {
                log('cache sent with delay ' + time);
                res.sendFile(cache.path(dir));
            },
            time);
            return;
        }
        log('cache not found, try relay from other proxies');

        // try get file from other proxies
        let exist = false;
        let start = false;
        for (proxy of this.app.proxies)
        {
            if (proxy.has(cache) && (
                app.conf.relay.source.sub && Pos.sub(proxy.pos, app.conf.pos) ||
                app.conf.relay.source.peer && Pos.peer(proxy.pos, app.conf.pos) ||
                app.conf.relay.source.super && Pos.super(proxy.pos, app.conf.pos)))
            {
                exist = true;
                // proxy.ping(app.conf.pos, (err, time) => { console.log(time); });
                proxy.relay(cache, this.app.conf.pos, (err, response, body) =>
                {
                    if (err || response.statusCode != 200)
                    {
                        log('relay failed');
                    }
                    else
                    {
                        log('relay succeeded');
                        if (app.conf.relay.save && app.save(cache, body))
                        {
                            log('save to [' + cache.path(dir) + ']');
                            setTimeout(() =>
                            {
                                log('cache sent with delay ' + time);
                                res.sendFile(cache.path(dir));
                            },
                            time);
                        }
                        else
                        {
                            res.set('content-type', response.headers['content-type']);
                            res.set('content-length', response.headers['content-length']);
                            log('cache sent with delay ' + time);
                            res.send(body);
                        }
                    }
                });
                return;
            }
        }

        // no proxy has cache, directly fetch from source
        if (!exist)
        {
            log('no proxy has cache');
            if (app.conf.relay.fetch)
            {
                // fetch file directly from source server
                cache.fetch((err, response, body) =>
                {
                    if (err || response.statusCode != 200)
                    {
                        log('fetch failed');
                        res.status(404).end('cache fetch failed');
                    }
                    else
                    {
                        log('fetch succeeded');
                        if (app.conf.relay.save && app.save(cache, body))
                        {
                            log('save to [' + cache.path(dir) + ']');
                            setTimeout(() =>
                            {
                                log('cache sent with delay ' + time);
                                res.sendFile(cache.path(dir));
                            },
                            time);
                        }
                        else
                        {
                            setTimeout(() =>
                            {
                                res.set('content-type', response.headers('content-type'));
                                res.set('content-length', response.headers('content-length'));
                                log('cache sent with delay ' + time);
                                res.send(body);
                            },
                            time);
                        }
                    }
                });
            }
            else
            {
                res.status(404).end('no cache in local/proxies, fetch is forbidden');
            }
        }
    });

    router.get('*', (req, res) =>
    {
        res.json(req.protocol + ':\/\/' + req.get('host') + req.originalUrl);
        return;
        request(req.protocol + ':\/\/' + req.get('host') + req.originalUrl).pipe(res);
    });
};