var express = require('express');
var path    = require('path');
var multer  = require('multer');
var file    = require('_/file');
var _       = require('./_');

var router = module.exports = express.Router();

const dir = path.join(__dirname, 'videos');

router.get('/', (req, res) =>
{
    res.json(videos());
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
    _.track.emit('update', videos());
});

router.delete('/', (req, res) =>
{
    res.json(file.clear(dir) ? 'ok' : 'error');
    _.track.emit('update', videos());
});

router.delete('/:video', (req, res) =>
{
    res.json(file.rm(path.join(dir, req.params.video)) ? 'ok' : 'error');
    _.track.emit('update', videos());
});

router.get('/:video/:chip', (req, res) =>
{
    var f = path.join(dir, req.params.video, req.params.chip);

    if (!file.exist(f))
    {
        console.log('client [' + req.ip + '] req [' + f + '] not exist');
        res.status(404).end();
        return;
    }
    console.log('client [' + req.ip + '] get [' + f + ']');
    res.sendFile(f);
});

function videos()
{
    list = {};
    folders = file.folders(dir);
    for (folder of folders)
    {
        list[folder] = file.files(path.join(dir, folder));
    }
    return list;
};

_.track.on('connect', () =>
{
    _.track.emit('update', videos());
});