let express = require('express');
let util    = require('util');
let Ip      = require('_/ip');
let File    = require('_/file');
let Slice   = require('./model/slice');

//
// this module handle the push-request, started by server and transfered by track
//
let mod = module.exports = function(app)
{
    this.app = app;
};

mod.prototype.on_push = function(server_info, video, piece)
{
    let app = this.app;
    let dir = app.dir;
    
    let ip = server_info.ip == '127.0.0.1' ? app.track.ip : server_info.ip;
	  let slice = new Slice(server_info.ip, server_info.conf.port, video, piece);

    let log = (...args) =>
    {
        app.log('[push] [%s]', slice.url(), util.format(...args));
    };

    // file exit
    if (File.exist(slice.path(dir)))
    {
        log('file already exist');
        return;
    }

    // do not response to push
    if (!app.conf.push)
    {
        log('ignored by config');
        return;
    }

    log('fetch begin');

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
                         slice.toString(),
                         slice.port,
                         Date.now() - tick,
                         'HTTP failed');
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

            if (File.save(slice.path(dir), body))
            {
                log('save to [' + slice.path(dir) + '] success');
                app.refresh();
            }
            else
                log('save to [' + slice.path(dir) + '] fail');
        }
    });
};