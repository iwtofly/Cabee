var fs     = require('fs');
var path   = require('path');
var mkdirp = require('mkdirp');

module.exports = file;

var cnts = {};

function file(name, dir)
{
    // kantai-1.jpg
    this.name    = name;
    // upload
    this.dir     = dir;
    // /kantai-1.jpg
    this.href    = '/' + this.name;
    // upload/kantai-1.jpg
    this.path    = path.join(dir, name);
    // wwwroot/upload/kantai-1.jpg
    this.pathAbs = path.resolve(this.path);
    // .jpg
    this.extname = path.extname(name);
};

file.prototype.toJSON = function()
{
    return this.href;
};

file.prototype.existSync = function()
{
    try
    {
        fs.accessSync(this.path, fs.R_OK | fs.W_OK);
        return true;
    }
    catch (err) {}
};

file.prototype.cnts = function()
{
    return cnts[this.name] ? cnts[this.name] : 0;
};

file.prototype.cnt = function()
{
    cnts[this.name] = this.cnts() + 1;
};

file.prototype.deleteSync = function()
{
    try
    {
        fs.unlinkSync(this.path);
        console.log('file delete success [' + this.path + ']');
        return true;
    }
    catch (err)
    {
        console.log(err);
        console.log('file delete fail [' + this.path + ']');
    }
};

file.listSync = function(dir)
{
    var ret = [];

    try
    {
        for (name of fs.readdirSync(dir))
        {
            ret.push(new file(name, dir));
        }
    }
    catch (err)
    {
        mkdirp(dir, (err) =>
        {
            if (err)
            {
                console.log(err);
                process.exit(0);
            }
        });
    }

    return ret;
};

file.clearSync = function(dir)
{
    for (f of file.listSync(dir))
    {
        f.deleteSync();
    }
    cnts = {};
};