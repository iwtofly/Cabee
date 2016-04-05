var express = require('express');
var cache   = require('./cache.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', (req, res) =>
{
    var caches = {};

    for (c of cache.listSync(_.cachePath))
    {
        caches[c.url] = true;
    }

    var files = {};

    for (ip in _.servers)
    {
        for (file of _.servers[ip])
        {
            var url = 'http://' + ip + file;
            files[url] = caches[url] ? true : '/pull/manual/' + encodeURIComponent(url);
        }
    }

    res.render('pull.j2',
    {
        'files' : files
    });
});

router.get('/manual/:file', (req, res) =>
{
    var c = new cache(req.params.file, _.cachePath);

    c.pull(_.fetchTimeout, (err) =>
    {
        if (err)
        {
            console.log('cache pull fail [' + c.url + ']');
        }
        else
        {
            console.log('cache pull success [' + c.url + ']');
        }
        res.redirect('/pull');
    });
});