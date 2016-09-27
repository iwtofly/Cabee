let express = require('express');
let path    = require('path');
let request = require('request');
let multer  = require('multer');
let File    = require('_/file');
let Cache   = require('_/cache');

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
        let host = req.get('shit');
        //let host = req.get('host');

        let c = new Cache
        (
            dir,
            host.substr(0, host.indexOf(':')),
            host.substr(host.indexOf(':') + 1),
            req.params.video,
            req.params.piece
        );

        // send from local cache
        let delay = app.delay.match(req.params.pos);

        if (File.exist(c.path))
        {
            this.app.log('client [' + req.ip + '] ' +
                         'get [' + c.url + '] ' +
                         'from [cache] in [' + delay + '] ms');
            setTimeout(() => { res.sendFile(c.path); }, delay);
            return;
        }

        // get from other proxies

        for (proxy of app.proxies)
        {
            if (proxy.has(cache))
            {
                
            }
        }

        res.end('cache not found');
    });

    router.get('*', (req, res) =>
    {
        res.json(req.protocol + ':\/\/' + req.get('host') + req.originalUrl);
        return;
        request(req.protocol + ':\/\/' + req.get('host') + req.originalUrl).pipe(res);
    });
};