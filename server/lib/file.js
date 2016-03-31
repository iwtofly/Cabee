var fs   = require('fs');
var path = require('path');

module.exports = file;

function file(name, dir)
{
    this.name    = name;
    this.dir     = dir;
    this.path    = path.join(dir, name);
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