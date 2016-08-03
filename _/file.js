var fs   = require('fs');
var path = require('path');

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

//========================= create =========================//
file.mkdir = (dir) =>
{
    try
    {
        if (!file.exist(dir))
        {
            fs.mkdirSync(dir);
            console.log('folder create [' + dir + ']');
        }
        return true;
    }
    catch (err) { console.log(err); }
};

//========================= query =========================//
file.exist = (f) =>
{
    try
    {
        fs.accessSync(f, fs.R_OK | fs.W_OK);
        return true;
    }
    catch (err) { console.log(err); }
};

file.ls = (dir) =>
{
    try
    {
        return fs.readdirSync(dir);
    }
    catch (err) { console.log(err); }
    return [];
}

file.files = (dir) =>
{
    try
    {
        return file.ls(dir).filter((f) =>
        {
            return fs.statSync(path.join(dir, f)).isFile();
        });
    }
    catch (err) { console.log(err); }
    return [];
};

file.folders = (dir) =>
{
    try
    {  
        return file.ls(dir).filter((f) =>
        {
            return fs.statSync(path.join(dir, f)).isDirectory();
        });
    }
    catch (err) { console.log(err); }
    return [];
};

//========================= delete =========================//
file.rm = (f) =>
{
    try
    {
        var stat = fs.statSync(f);

        if (stat.isFile())
        {
            return file.unlink(f);
        }
        else if (stat.isDirectory())
        {
            return file.clear(f) && file.rmdir(f);
        }
    }
    catch (err) { console.log(err); }
}

file.unlink = (f) =>
{
    try
    {
        fs.unlinkSync(f);
        console.log('file rm [' + f + ']');
        return true;
    }
    catch (err) { console.log(err); }
}

file.clear = (dir) =>
{
    var ret = true;
    for (f of file.ls(dir))
    {
        ret &= file.rm(path.join(dir, f));
    }
    if (ret)
    {
        console.log('folder clear [' + dir + ']');
        return true;
    }
};

file.rmdir = (dir) =>
{
    try
    {
        fs.rmdirSync(dir);
        console.log('folder rm [' + dir + ']');
        return true;
    }
    catch (err) { console.log(err); }
}