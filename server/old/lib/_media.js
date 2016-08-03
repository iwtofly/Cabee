var express = require('express');
var fs      = require('fs');
var path    = require('path');
var file    = require('./file.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', (req, res) =>
{
    var files = file.listSync(_.filePath);

    for (f of files)
    {
        f.hits = _.hits[f.href];
    }

    res.render('media.j2',
    {
        'files' : files
    });
});

router.get('/delete/:file', (req, res) =>
{
    (new file(req.params.file, _.filePath)).deleteSync();
    res.redirect('/media');
});

router.get('/clear', (req, res) =>
{
    file.clearSync(_.filePath);
    res.redirect('/media');
});

var multer = require('multer');
var storage = multer.diskStorage(
{
    'destination' : (req, file, cb) =>
    {
        cb(null, _.filePath);
    },
    'filename' : (req, file, cb) =>
    {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage })

router.post('/upload', upload.array('file'), (req, res) =>
{
    if (req.files.length > 0)
    {
        for (f of req.files)
        {
            console.log('file uploaded [' + f.path + ']');
        }
    }
    res.redirect('/media');
});