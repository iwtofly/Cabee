var fs     = require('fs');
var path   = require('path');

module.exports = file;

function file() {};

//========================= create =========================//
file.mkdir = (dir) =>
{
    try
    {
        var parent = path.dirname(dir);
        if (!file.exist(parent) && !file.mkdir(parent))
            return undefined;
        fs.mkdirSync(dir);
        console.log('folder create [' + dir + ']');
        return true;
    }
    catch (err) {}
};

file.save = (f, buffer) =>
{
    try
    {
        file.mkdir(path.dirname(f)) && fs.writeFileSync(f, buffer);
        return true;
    }
    catch (err) {}
};

//========================= query =========================//
file.exist = (f) =>
{
    try
    {
        fs.accessSync(f, fs.R_OK | fs.W_OK);
        return true;
    }
    catch (err) {}
};

file.ls = (dir) =>
{
    try
    {
        return fs.readdirSync(dir);
    }
    catch (err) {}
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
    catch (err) {}
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
    catch (err) {}
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
    catch (err) {}
}

file.unlink = (f) =>
{
    try
    {
        fs.unlinkSync(f);
        console.log('file rm [' + f + ']');
        return true;
    }
    catch (err) {}
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
    catch (err) {}
}