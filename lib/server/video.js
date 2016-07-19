var express = require('express');
var path    = require('path');
var multer  = require('multer');
var file    = require('../_/file.js');

var router = module.exports = express.Router();

const dir = 'app/server/videos';

//
router.get('/', (req, res) =>
{
    res.json(file.folders(dir));
});

//
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
    res.send('upload videos');
});

//
router.get('/rm/:video', (req, res) =>
{
    file.rmdir(path.join(dir, req.params.video));
    res.send('rm video');
});

//
router.get('/:video/:piece', (req, res) =>
{
    res.json([req.params.video, req.params.piece]);
});