let express = require('express');
let request = require('request');
let Ip      = require('_/ip');
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
        let src_ip  = Ip.format(req.ip);
        let src_pos = req.params.pos;

        app.log('[pong] [%s|%s] begin', src_ip, src_pos);
        app.gui.emit('pong_bgn', src_ip, src_pos);

        let time = this.match(src_pos);

        setTimeout(() =>
        {
            app.log('[pong] [%s|%s] end after [%s]ms', src_ip, src_pos, time);
            app.gui.emit('pong_end', src_ip, src_pos, time);
            
            res.json(time);
        },
        time);
    });

    router.get('/ping/:ip/:port', (req, res) =>
    {
        let dst_ip   = Ip.format(req.params.ip);
        let dst_port = req.params.port;

        app.log('[ping] [%s|%s] begin', dst_ip, dst_port);
        app.gui.emit('ping_bgn', dst_ip, dst_port);

        let tick = Date.now();

        request(
        {
            'url' : 'http://' + dst_ip + ':' + dst_port + '/delay/ping/' + this.app.conf.pos,
            'json' : true
        },
        (error, response, body) =>
        {
            if (error || response.statusCode != 200)
            {            
                app.log('ping [%s] failed', proxy.toString());
                app.gui.emit('ping_end',
                              dst_ip,
                              dst_port,
                              'HTTP failed',
                              Date.now() - tick);
                res.status(404).end('HTTP failed');
            }
            else
            {
                app.log('ping [%s|%s] succeeded in [%s]ms', dst_ip, dst_port, body);
                app.gui.emit('ping_end',
                              dst_ip,
                              dst_port,
                              'ok',
                              body);
                res.json(body);
            }
        });
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