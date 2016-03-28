var express = require('express');
var fs      = require('fs');
var path    = require('path');
var share   = require('./share.js');

var router = express.Router();
module.exports = router;

router.get('/media', function(req, res)
{
    res.render('media.j2', {'files' : share.uploads()});
});

router.get('/media/delete/:file', function(req, res)
{
    share.upload_delete(req.params.file);
    res.redirect('/media');
});

router.get('/media/clear', function(req, res)
{
    for (file of share.uploads())
    {
        share.upload_delete(file);
    }
    res.redirect('/media');
});

var multer = require('multer');
var storage = multer.diskStorage(
{
    'destination' : function (req, file, cb)
    {
        cb(null, './upload/');
    },
    'filename' : function (req, file, cb)
    {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage })

router.post('/media/upload', upload.array('file'), function(req, res)
{
    if (req.files.length > 0)
    {
        for (file of req.files)
        {
            share.log('file uploaded : ' + file.path);
        }
    }
    res.redirect('/media');
});

router.get('/media/list', function(req, res)
{
    res.json(share.uploads());
});