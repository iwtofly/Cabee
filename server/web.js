var express = require('express');
var path    = require('path');
var file    = require('_/file');
var _       = require('./_');

var router = module.exports = express.Router();

const dir = path.join(__dirname, 'videos');

router.get('/', (req, res) =>
{
    res.json(videos());
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

    var time = _.delay.match(req.ip);
    setTimeout(function()
    {
        console.log('client [' + req.ip + '] get [' + f + '] in ' + time + ' ms');
        res.sendFile(f);
    },
    time);
});

router.get('/ping', (req, res) =>
{
    res.json(_.delay.match(req.ip));
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