let express = require('express');
let path    = require('path');
let multer  = require('multer');
let util    = require('util');
let ffprobe = require('node-ffprobe');
let File    = require('_/file');
let Ip      = require('_/ip');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.dir    = path.join(__dirname, 'videos', app.conf.port.toString());
    this.router = express.Router();

    this.init();
};

mod.prototype.init = function()
{
    let app    = this.app;
    let router = this.router;
    let dir    = this.dir;

    router.get('/', (req, res) =>
    {
        res.json(this.list());
    });

    router.get('/upload', (req, res) =>
    {
        res.render('main.j2');
    });

    let storage = multer.diskStorage(
    {
        'destination' : (req, f, cb) =>
        {
            let dst = path.join(dir, req.body['name']);
            File.mkdir(dst);
            cb(null, dst);
        },
        'filename' : (req, f, cb) =>
        {
            cb(null, f.originalname);
        }
    });

    let upload = multer({ storage: storage });

    router.post('/upload', upload.array('videos'), (req, res) =>
    {
        if (req.files.length > 0)
        {
            for (f of req.files)
            {
                this.app.log('file uploaded [' + f.path + ']');
            }
        }
        res.json('ok');
    });

    router.delete(
    [
        '/',
        '/:video'
    ],
    (req, res) =>
    {
        res.json(File.rm(path.join(dir, req.params.video || '')) ? 'ok' : 'error');
    });

    router.get('/time/:video/:chip', (req, res) =>
    {
        let relative = req.params.video + '/' + req.params.chip;
        let absolute = path.join(dir, relative);

        ffprobe(absolute, (err, data) =>
        {
            if (err)
            {
                this.app.log('time-query [%s] error: [%s]', relative, err);
                res.status(404).end();
            }
            else
            {
                let time = data.format.duration.toString();
                this.app.log('time-query [%s] return: [%s]', relative, time);
                res.json(time);
            }
        });
    });

    router.get(
    [
        '/:video/:chip',
        '/:video/:chip/:pos'
    ],
    (req, res) =>
    {
        let ip = Ip.format(req.ip);
        let log = (...args) =>
        {
            app.log('[%s|%s]=>[%s]  %s',
                    ip,
                    req.params.pos,
                    req.params.video + '/' + req.params.chip,
                    util.format(...args));
        };

        log('begin');
        app.gui.emit('offer_bgn',
                      ip,
                      req.params.pos,
                      req.params.video + '/' + req.params.chip);

        let f = path.join(dir, req.params.video, req.params.chip);

        if (!File.exist(f))
        {
            log('file not exist');
            app.gui.emit('offer_end',
                          ip,
                          req.params.pos,
                          req.params.video + '/' + req.params.chip,
                          0,
                          'file not exist');

            res.status(404).end();
            return;
        }
        let delay = app.delay.match(req.params.pos);

        setTimeout(() =>
        {
            log('file sent with delay [%s]ms', delay);
            app.gui.emit('offer_end',
                          ip,
                          req.params.pos,
                          req.params.video + '/' + req.params.chip,
                          delay,
                          'ok');

            res.sendFile(f);
        },
        delay);
    });
}

mod.prototype.list = function()
{
    list = {};
    folders = File.folders(this.dir);
    for (folder of folders)
    {
        list[folder] = File.files(path.join(this.dir, folder));
    }
    return list;
};