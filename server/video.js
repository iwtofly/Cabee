var express = require('express');
var path    = require('path');
var multer  = require('multer');
var file    = require('_/file.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

const dir = path.join(__dirname, 'videos');

router.get('/', (req, res) =>
{
    list = {};
    videos = file.folders(dir);
    for (folder of videos)
    {
        list[folder] = file.files(path.join(dir, folder));
    }
    res.json(list);
});

router.get('/upload', (req, res) =>
{
    res.render('main.j2');
});

var storage = multer.diskStorage(
{
    'destination' : (req, f, cb) =>
    {
        var dst = path.join(dir, req.body['name']);
        file.mkdir(dst);
        cb(null, dst);
    },
    'filename' : (req, f, cb) =>
    {
        cb(null, f.originalname);
    }
});
var upload = multer({ storage: storage });

router.post('/upload', upload.array('videos'), (req, res) =>
{
    if (req.files.length > 0)
    {
        for (f of req.files)
        {
            console.log('file uploaded [' + f.path + ']');
        }
    }
    res.json('ok');
});

router.delete('/:video', (req, res) =>
{
    res.json(file.rm(path.join(dir, req.params.video)) ? 'ok' : 'error');
});

router.get('/:video/:chip', (req, res) =>
{
    var f = path.join(dir, req.params.video, req.params.chip);

    if (!file.exist(f))
    {
        console.log('client [' + req.ip + '] req [' + f + '] not exist');
        res.status(404).end();
    }

    var time = _.delay.match(req.ip);
    setTimeout(function()
    {
        console.log('client [' + req.ip + '] get [' + f + '] in ' + time + ' ms');
        res.sendFile(f);
    },
    time);
});

router.get('/:video/:chip/now', (req, res) =>
{
    var f = path.join(dir, req.params.video, req.params.chip);

    if (!file.exist(f))
    {
        console.log('client [' + req.ip + '] req [' + f + '] not exist');
        res.status(404).end();
    }
    res.sendFile(f);
});