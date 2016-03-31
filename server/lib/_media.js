var express = require('express');
var fs      = require('fs');
var path    = require('path');
var file    = require('./file.js');
var _       = require('./_.js');

var router = module.exports = express.Router();

router.get('/', function(req, res)
{
    res.render('media.j2',
    {
        'files' : file.list(_.mediaPath)
    });
});

router.get('/delete/:file', function(req, res)
{
    (new file(req.params.file, _.mediaPath)).delete();
    res.redirect('/media');
});

router.get('/clear', function(req, res)
{
    for (f of file.list(_.mediaPath))
    {
        f.delete();
    }
    res.redirect('/media');
});

var multer = require('multer');
var storage = multer.diskStorage(
{
    'destination' : function (req, file, cb)
    {
        cb(null, _.mediaPath);
    },
    'filename' : function (req, file, cb)
    {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage })

router.post('/upload', upload.array('file'), function(req, res)
{
    if (req.files.length > 0)
    {
        for (f of req.files)
        {
            console.log('file uploaded : ' + f.path);
        }
    }
    res.redirect('/media');
});