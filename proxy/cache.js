let express = require('express');
let path    = require('path');
let request = require('request');
let multer  = require('multer');
let File    = require('_/File');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.dir    = path.join(__dirname, 'caches', app.conf.port.toString());
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

    router.get('/:shit', (req, res) =>
    {
        res.json(req.params.shit);
    });

    router.get('/', (req, res) =>
    {
        res.json(this.list());
    });

    // original url of target is [http://$ip:$port/video/$video/$piece]
    router.get('/:ip/:port/:video/:piece', (req, res) =>
    {
        let c = new cache
        (
            dir,
            req.params.ip,
            req.params.port,
            req.params.video,
            req.params.piece
        );

        let delay = app.delay.time(req.ip);

        if (File.exist(c.path))
        {
            console.log('client [' + req.ip + '] ' +
                        'get [' + c.url + '] ' +
                        'from [cache] in [' + delay + '] ms');
            setTimeout(() => { res.sendFile(c.path); }, delay);
            return;
        }

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
                console.log('client [' + req.ip + '] ' +
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
    for (port of File.folders(path.join(this.dir, ip)))
    for (video of File.folders(path.join(this.dir, ip, port)))
    {
        list[ip][port][video] = File.Files(path.join(this.dir, ip, port, video));
    }
    return list;
};

function cache(dir, ip, port, video, piece)
{
    this.ip    = ip;
    this.port  = port;
    this.video = video;
    this.piece = piece;
    this.url   = 'http://' + ip + ':' + port + '/video/' + video + '/' + piece;
    this.path  = path.join(dir, ip, port, video, piece);
};