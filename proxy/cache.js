let express = require('express');
let path    = require('path');
let request = require('request');
let multer  = require('multer');
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
        let c = new Cache
        (
            dir,
            req.params.ip,
            req.params.port,
            req.params.video,
            req.params.piece
        );

        let delay = app.delay.match(req.params.pos);

        // try get file from local cache
        if (File.exist(c.path))
        {
            this.app.log('client [' + req.ip + '] ' +
                         'get [' + c.url + '] ' +
                         'from [cache] in [' + delay + '] ms');
            setTimeout(() => { res.sendFile(c.path); }, delay);
            return;
        }

        // fetch file directly from source server
        request(
        {
            'url'      : c.url,
            'encoding' : null,
            'timeout'  : 3000,
        },
        (error, response, body) =>
        {
            if (!error && response.statusCode == 200 && File.save(c.path, body))
            {
                this.app.log('client [' + req.ip + '] ' +
                            'get [' + c.url + '] ' +
                            'from [source] in [' + delay + '] ms');
                setTimeout(() => { res.sendFile(c.path); }, delay);
            }
            else
            {
                res.status(404).end();
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