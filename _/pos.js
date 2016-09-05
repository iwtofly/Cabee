let Pos = module.exports = function(path)
{
    this.path = path;
};

Pos.prototype.equal = function(another)
{
    return this.path == another.path;
};

Pos.prototype.peer = function(another)
{
    return this.path.slice(0, -1) == another.path.slice(0, -1);
};

Pos.prototype.inside = function(another)
{
    return this.path.length > another.path.length &&
           this.path.substr(0, another.path.length) == another.path;
};

Pos.prototype.contain = function(another)
{
    return another.inside(this);
};