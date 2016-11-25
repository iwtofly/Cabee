let express = require('express');
let util    = require('util');
let Ip      = require('_/ip');
let File    = require('_/file');
let Cache   = require('_/cache');

let mod = module.exports = function(app)
{
    this.app = app;
};

mod.prototype.on_push = function(server_ip, server_port, video, piece)
{
    let app = this.app;
    let dir = app.dir;
    
    server_ip = server_ip == '127.0.0.1' ? app.track.link.ip() : server_ip;
	let cache = new Cache(server_ip, server_port, video, piece);

    let log = (...args) =>
    {
        app.log('[push] [%s]', cache.url(), util.format(...args));
    };

    if (File.exist(cache.path(dir)))
    {
        log('file already exist');
        return;
    }
    log('fetch begin');

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
                         cache.toString(),
                         cache.port,
                         Date.now() - tick,
                         'HTTP failed');
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

            if (app.conf.push.save && File.save(cache.path(dir), body))
            {
                log('save to [' + cache.path(dir) + '] success');
                app.refresh();
            }
            else
                log('save to [' + cache.path(dir) + '] fail');
        }
    });
};