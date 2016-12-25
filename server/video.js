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

mod.prototype.init = function()
{
    let app    = this.app;
    let router = this.router;
    let dir    = this.dir;

    router.get('/', (req, res) =>
    {
        res.render('video.j2', {'list' : app.video.list()});
    });

    router.get('/list', (req, res) =>
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
                app.log('file uploaded [' + f.path + ']');
            }
        }
        res.json('ok');
        app.refresh();
    });

    router.get('/time/:video/:piece', (req, res) => {
        let relative = req.params.video + '/' + req.params.piece;
        let absolute = path.join(dir, relative);

        ffprobe(absolute, (err, data) =>
        {
            if (err)
            {
                app.log('time-query [%s] error: [%s]', relative, err);
                res.status(404).end();
            }
            else
            {
                let time = data.format.duration;
                app.log('time-query [%s] return: [%s]', relative, time);
                res.json(time);
            }
        });
    });

    router.get(
    [
        '/:video/:piece',
        '/:video/:piece/:pos'
    ],
    (req, res) =>
    {
        let ip = Ip.format(req.ip);
        let log = (...args) =>
        {
            app.log('[%s|%s]=>[%s]  %s',
                    ip,
                    req.params.pos,
                    req.params.video + '/' + req.params.piece,
                    util.format(...args));
        };

        log('begin');
        app.gui.emit('offer_bgn',
                      ip,
                      req.params.pos,
                      req.params.video + '/' + req.params.piece);

        let f = path.join(dir, req.params.video, req.params.piece);

        if (!File.exist(f))
        {
            log('file not exist');
            app.gui.emit('offer_end',
                          ip,
                          req.params.pos,
                          req.params.video + '/' + req.params.piece,
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
                          req.params.video + '/' + req.params.piece,
                          delay,
                          'ok');

            res.sendFile(f);
        },
        delay);
    });
    
    router.delete(
    [
        '/',
        '/:video',
        '/:video/:piece'
    ],
    (req, res) =>
    {
        let folder = path.join
        ( 
            dir,
            req.params.video || '',
            req.params.piece || ''
        );
        res.json(File.rm(folder) ? 'ok' : 'error');
        app.refresh();
    });
}