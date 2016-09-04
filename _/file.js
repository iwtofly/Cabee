var fs     = require('fs');
var path   = require('path');

module.exports = File;

function File() {};

//========================= create =========================//
File.mkdir = (dir) =>
{
    try
    {
        var parent = path.dirname(dir);
        if (!File.exist(parent) && !File.mkdir(parent))
            return undefined;
        fs.mkdirSync(dir);
        console.log('folder create [' + dir + ']');
        return true;
    }
    catch (err) {}
};

File.save = (f, buffer) =>
{
    try
    {
        File.mkdir(path.dirname(f)) && fs.writeFileSync(f, buffer);
        return true;
    }
    catch (err) {}
};

//========================= query =========================//
File.exist = (f) =>
{
    try
    {
        fs.accessSync(f, fs.R_OK | fs.W_OK);
        return true;
    }
    catch (err) {}
};

File.ls = (dir) =>
{
    try
    {
        return fs.readdirSync(dir);
    }
    catch (err) {}
    return [];
}

File.Files = (dir) =>
{
    try
    {
        return File.ls(dir).filter((f) =>
        {
            return fs.statSync(path.join(dir, f)).isFile();
        });
    }
    catch (err) {}
    return [];
};

File.folders = (dir) =>
{
    try
    {  
        return File.ls(dir).filter((f) =>
        {
            return fs.statSync(path.join(dir, f)).isDirectory();
        });
    }
    catch (err) {}
    return [];
};

//========================= delete =========================//
File.rm = (f) =>
{
    try
    {
        var stat = fs.statSync(f);

        if (stat.isFile())
        {
            return File.unlink(f);
        }
        else if (stat.isDirectory())
        {
            return File.clear(f) && File.rmdir(f);
        }
    }
    catch (err) {}
}

File.unlink = (f) =>
{
    try
    {
        fs.unlinkSync(f);
        console.log('File rm [' + f + ']');
        return true;
    }
    catch (err) {}
}

File.clear = (dir) =>
{
    var ret = true;
    for (f of File.ls(dir))
    {
        ret &= File.rm(path.join(dir, f));
    }
    if (ret)
    {
        console.log('folder clear [' + dir + ']');
        return true;
    }
};

File.rmdir = (dir) =>
{
    try
    {
        fs.rmdirSync(dir);
        console.log('folder rm [' + dir + ']');
        return true;
    }
    catch (err) {}
}