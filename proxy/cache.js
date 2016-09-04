let express = require('express');
let path    = require('path');
let multer  = require('multer');
let File    = require('_/File');

let mod = module.exports = function(app)
{
    this.dir    = path.join(__dirname, 'caches', app.conf.port.toString());
    this.router = express.Router();

    this.init();
};

mod.prototype.init = function()
{
    let dir    = this.dir;
    let router = this.router;

    router.get('/', (req, res) =>
    {
        res.json('shit');
    });

    // original url of target is [http://$ip/video/$video/$piece]
    router.get('/:ip/:video/:piece', (req, res) =>
    {
        var c = new cache(req.params.ip, req.params.video, req.params.piece);

        request(
        {
            'url'      : c.url,
            'encoding' : null,
            'timeout'  : 3000,
        },
        (error, response, body) =>
        {
            if (!error && response.statusCode == 200 && file.save(c.path, body))
            {
                console.log('client [' + req.ip + '] get [' + c.url + ']');
                res.sendFile(c.path);
            }
            else
            {
                res.status(404).end();
            }
        });
    });

    router.delete('/', (req, res) =>
    {
        res.json(file.clear(dir) ? 'ok' : 'error');
    });

    router.delete('/:ip/:video', (req, res) =>
    {
        res.json(file.rm(path.join(dir, req.params.ip)) ? 'ok' : 'error');
    });
};

function cache(ip, video, piece)
{
    this.ip    = ip;
    this.video = video;
    this.piece = piece;
    this.url   = 'http://' + ip + '/video/' + video + '/' + piece;
    this.path  = path.join(dir, ip.replace(':', '_'), video, piece);
};