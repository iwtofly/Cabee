let express = require('express');
let Rules   = require('_/rules');

let mod = module.exports = function(app)
{
    this.rules = new Rules(app.conf.delay);
    this.router = express.Router();

    this.init();
};

mod.prototype.init = function()
{
    let rules  = this.rules;
    let router = this.router;

    router.get('/', (req, res) =>
    {
        res.json(rules.all());
    });

    router.get('/ping/:ip', (req, res) =>
    {
        res.json(rules.match(req.params.ip));
    });

    router.get('/ping', (req, res) =>
    {
        res.json(rules.match(req.ip));
    });
};