var router = module.exports= require('express').Router();

var track = require('./_.js').track;

router.put('/connect', (req, res) =>
{
    track.connect();
    res.json('ok');
});

router.put('/disconnect', (req, res) =>
{
    track.disconnect();
    res.json('ok');
});

router.get('/connected', (req, res) =>
{
    res.json(track.connected);
});