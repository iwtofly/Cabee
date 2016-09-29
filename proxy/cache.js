let express = require('express');
let path    = require('path');
let request = require('request');
let multer  = require('multer');
let util    = require('util');
let File    = require('_/file');
let Cache   = require('_/cache');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.dir    = app.dir;
    this.router = express.Router();

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
        res.json(this.list());
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
        let cache = new Cache
        (
            req.params.ip,
            req.params.port,
            req.params.video,
            req.params.piece
        );
        
        let log = (text) =>
        {
            app.log(util.format('[%s]=>[%s]  %s', req.ip, cache.url(), text));
        };

        let time = app.delay.match(req.params.pos);

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
        log('cache not found');

        // fetc from source
        if (!app.conf.cache.fetch)
        {
            res.status(404).end('no cache in local, fetch is forbidden');
            return;
        }
        log('try fetch from source');

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
                if (app.conf.cache.save && app.save(cache, body))
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
                        res.set('content-type', response.headers['content-type']);
                        res.set('content-length', response.headers['content-length']);
                        log('cache sent with delay ' + time);
                        res.send(body);
                    },
                    time);
                }
            }
        });
    });

    router.delete(
    [
        '/',
        '/:ip',
        '/:ip/:port',
        '/:ip/:port/:video'
    ],
    (req, res) =>
    {
        let folder = path.join
        (
            dir,
            req.params.ip    || '',
            req.params.port  || '',
            req.params.video || ''
        );
        res.json(File.rm(folder) ? 'ok' : 'error');
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