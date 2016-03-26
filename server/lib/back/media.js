var express = require('express');
var fs      = require('fs');
var path    = require('path');
var share   = require('./share.js');
var router  = express.Router();

module.exports = router;

router.get('/media', function(req, res)
{
    res.render('media.j2', {'files' : share.upload_list()});
});

router.get('/media/delete/:file', function(req, res)
{
    var file = path.join(share.upload_path, req.params['file']);

    try
    {
        fs.unlinkSync(file);
        share.log('file deleted : ' + file);
    }
    catch (err)
    {
        share.log(err);
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