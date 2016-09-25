var fs     = require('fs');
var path   = require('path');

let mod = module.exports = {};

//========================= create =========================//
mod.mkdir = (dir) =>
{
    try
    {
        var parent = path.dirname(dir);
        if (!mod.exist(parent) && !mod.mkdir(parent))
            return undefined;
        fs.mkdirSync(dir);
        console.log('folder create [' + dir + ']');
        return true;
    }
    catch (err) {}
};

mod.save = (f, buffer) =>
{
    try
    {
        mod.mkdir(path.dirname(f)) && fs.writemodSync(f, buffer);
        return true;
    }
    catch (err) {}
};

//========================= query =========================//
mod.exist = (f) =>
{
    try
    {
        fs.accessSync(f, fs.R_OK | fs.W_OK);
        return true;
    }
    catch (err) {}
};

mod.ls = (dir) =>
{
    try
    {
        return fs.readdirSync(dir);
    }
    catch (err) {}
    return [];
}

mod.files = (dir) =>
{
    try
    {
        return mod.ls(dir).filter((f) =>
        {
            return fs.statSync(path.join(dir, f)).isFile();
        });
    }
    catch (err) {}
    return [];
};

mod.folders = (dir) =>
{
    try
    {  
        return mod.ls(dir).filter((f) =>
        {
            return fs.statSync(path.join(dir, f)).isDirectory();
        });
    }
    catch (err) {}
    return [];
};

//========================= delete =========================//
mod.rm = (f) =>
{
    try
    {
        var stat = fs.statSync(f);

        if (stat.ismod())
        {
            return mod.unlink(f);
        }
        else if (stat.isDirectory())
        {
            return mod.clear(f) && mod.rmdir(f);
        }
    }
    catch (err) {}
}

mod.unlink = (f) =>
{
    try
    {
        fs.unlinkSync(f);
        console.log('mod rm [' + f + ']');
        return true;
    }
    catch (err) {}
}

mod.clear = (dir) =>
{
    var ret = true;
    for (f of mod.ls(dir))
    {
        ret &= mod.rm(path.join(dir, f));
    }
    if (ret)
    {
        console.log('folder clear [' + dir + ']');
        return true;
    }
};

mod.rmdir = (dir) =>
{
    try
    {
        fs.rmdirSync(dir);
        console.log('folder rm [' + dir + ']');
        return true;
    }
    catch (err) {}
}