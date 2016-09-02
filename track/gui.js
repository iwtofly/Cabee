var router = module.exports = require('express').Router();

router.get('/', (req, res) =>
{
    res.render('main.j2');
});