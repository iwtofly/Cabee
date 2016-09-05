let express = require('express');
let path    = require('path');
let multer  = require('multer');
let File    = require('_/File');

let mod = module.exports = function(app)
{
    this.app    = app;
    this.dir    = path.join(__dirname, 'videos', app.conf.port.toString());
    this.router = express.Router();

    this.init();
};

mod.prototype.init = function()
{
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
                console.log('file uploaded [' + f.path + ']');
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

    router.get(
    [
        '/:video/:chip',
        '/:video/:chip/:pos'
    ],
    (req, res) =>
    {
        let f = path.join(dir, req.params.video, req.params.chip);

        if (!File.exist(f))
        {
            console.log('client [' + req.ip + '] req [' + f + '] not exist');
            res.status(404).end();
            return;
        }
        let time = this.app.delay.match(req.params.pos);
        console.log('client [' + req.ip + '] get [' + f + '] in [' + time + '] ms');
        setTimeout(() => { res.sendFile(f); }, time);
    });
}

mod.prototype.list = function()
{
    list = {};
    folders = File.folders(this.dir);
    for (folder of folders)
    {
        list[folder] = File.Files(path.join(this.dir, folder));
    }
    return list;
};