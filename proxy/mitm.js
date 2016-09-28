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
        let pos  = req.params.pos;
        let host = req.get('shit');
        //let host = req.get('host');

         let cache = new Cache
        (
            dir,
            host.substr(0, host.indexOf(':')),
            host.substr(host.indexOf(':') + 1),
            req.params.video,
            req.params.piece
        );

        let delay = this.app.delay.match(pos);
        // try get file from local cache
        
        if (File.exist(cache.path))
        {
            this.app.log('client [' + req.ip + '] ' +
                         'get [' + cache.url + '] ' +
                         'from [cache] in [' + delay + '] ms');
            setTimeout(() => { res.sendFile(cache.path); }, delay);
            return;
        }

        // get from other proxies
        for (proxy of this.app.proxies)
        {
            if (proxy.has(cache))
            {
                proxy.ping(app.conf.pos, (err, time) => { console.log(time); });
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