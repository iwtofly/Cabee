let express = require('express'); 
let path    = require('path');
let request = require('request');
let multer  = require('multer');
let util    = require('util');
let Ip      = require('_/ip');
let File    = require('_/file');
let Slice   = require('./model/slice');
let Fetch   = require('./model/fetch');

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
        app.gui.emit('offer_bgn',
                      src_ip,
                      src_pos,
                      slice.toString());
        
        if (File.exist(slice.path(dir)))
        {
            log('cache found');
            setTimeout(() =>
            {
                log('cache sent with delay ' + delay);
                app.gui.emit('offer_end',
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

        Fetch.from_proxy(app,
                         src_ip,
                         src_pos,
                         log,
                         slice,
                         delay,
                         app.conf.cache.save,
                         res,
                         () =>
        {
            log('no proxy has cache');

            // fetch forbidden
            if (!app.conf.relay.fetch)
            {
                log('no cache & fetch is forbidden');
                app.gui.emit('offer_end',
                              src_ip,
                              src_pos,
                              slice.toString(),
                              0,
                              'no cache & fetch is forbidden');
                res.status(404).end('no cache & fetch is forbidden');
            }
            
            Fetch.from_server(app,
                              src_ip,
                              src_pos,
                              log,
                              slice,
                              delay,
                              app.conf.relay.save,
                              res);
        });
    });
};
