var fs     = require('fs');
var path   = require('path');

module.exports = file;

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

file.prototype.exist = function()
{
    return file.exist(this.path);
};

file.prototype.rm = function()
{
    file.rm(this.path);
};

// static functions

file.exist = (f) =>
{
    try
    {
        fs.accessSync(f, fs.R_OK | fs.W_OK);
        return true;
    }
    catch (err) {}
};

file.rm = (f) =>
{
    try
    {
        var stat = fs.statSync(f);

        if (stat.isFile())
        {
            fs.unlinkSync(this.path);
            console.log('file rm [' + this.path + ']');
        }
        else if (stat.isDirectory())
        {
            file.clear(f);
            fs.rmdirSync(dir);
            console.log('folder rm [' + dir + ']');
        }
    }
    catch (err)
    {
        console.log(err);
    }
}

file.mkdir = (dir) =>
{
    if (!file.exist(dir))
    {
        fs.mkdirSync(dir);
    }
};

file.clear = (dir) =>
{
    for (f of fs.readdirSync(dir))
    {
        file.rm(f);
    }
    console.log('folder clear [' + dir + ']');
};

file.fs = (dir) =>
{
    try
    {
        return fs.readdirSync(dir);
    }
    catch (err)
    {
        console.log(err);
    }
    return [];
}

file.files = (dir) =>
{
    try
    {
        for (f of fs.)
        {
            ret.push(new file(f, dir));
        }
    }
    catch (err)
    {
        console.log(err);
    }
    return [];
};

file.folders = (dir) =>
{
    try
    {  
        return file.fs().filter((f) =>
        {
            return fs.statSync(path.join(dir, f)).isDirectory();
        });
    }
    catch (err)
    {
        console.log(err);
    }
    return [];
};