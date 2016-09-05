let express = require('express');
let Pos     = require('_/pos');

let mod = module.exports = function(app)
{
    this.rules = [];
    for (rule of app.conf.delay)
    {
        this.rules.push([new Pos(rule[0]), rule[1]]);
    }
    this.router = express.Router();

    this.init();
};

mod.prototype.init = function()
{
    let rules  = this.rules;
    let router = this.router;

    router.get('/', (req, res) =>
    {
        res.json(rules);
    });

    router.get(
    [
        '/ping',
        '/ping/:pos'
    ],
    (req, res) =>
    {
        res.json(this.match(req.params.pos));
    });
};

mod.prototype.match = function(pos = '')
{
    pos = new Pos(pos.toString());

    for (let [mask, time] of this.rules)
    {
        if (pos.equal(mask) || pos.inside(mask))
        {
            return time;
        }
    }
    return 0;
};