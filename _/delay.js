let express = require('express');
let Pos     = require('_/pos');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.rules  = app.conf.delay;
    this.router = express.Router();

    this.init();
};

mod.prototype.init = function()
{
    let app    = this.app;
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
        app.log('[pong] [%s|%s] begin', req.ip, req.params.pos);
        app.gui.emit('pong_bgn', req.ip, req.params.pos);

        let time = this.match(req.params.pos);

        setTimeout(() =>
        {
            app.log('[pong] [%s|%s] end after [%s]ms', req.ip, req.params.pos, time);
            app.gui.emit('pong_end', req.ip, req.params.pos, time);
            
            res.json(time);
        },
        time);
    });
};

mod.prototype.match = function(pos = '')
{
    for (let [pos2, time] of this.rules)
    {
        if (pos2 == '*' || Pos.equal(pos, pos2) || Pos.sub(pos, pos2))
        {
            return time;
        }
    }
    return 0;
};