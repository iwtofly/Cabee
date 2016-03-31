var fs   = require('fs');
var path = require('path');

module.exports = file;

var cnts = {};

function file(name, dir)
{
    // kantai-1.jpg
    this.name    = name;
    // /kantai-1.jpg
    this.href    = '/' + name;
    // E:\Cabee\server\media
    this.dir     = dir;
    // E:\Cabee\server\media\kantai-1.jpg
    this.path    = path.join(dir, name);
    // .jpg
    this.extname = path.extname(name);
};

file.prototype.toJSON = function()
{
    return this.name;
};

file.prototype.exist = function()
{
    try
    {
        return fs.statSync(this.path).isFile();
    }
    catch (err)
    {
        console.log(err);
    }
};

file.prototype.cnts = function()
{
    return cnts[this.name] ? cnts[this.name] : 0;
};

file.prototype.cnt = function()
{
    cnts[this.name] = this.cnts() + 1;
};

file.prototype.delete = function()
{
    try
    {
        fs.unlinkSync(this.path);
        console.log('file deleted : ' + this.path);
    }
    catch (err)
    {
        console.log(err);
    }
};

file.list = function(dir)
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
        console.log(err);
    }

    return ret;
};

file.clear = function(dir)
{
    for (f of file.list(dir))
    {
        f.delete();
    }
    cnts = {};
};