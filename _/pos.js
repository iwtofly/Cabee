let assert = require('assert');

let Pos = module.exports = function(path)
{
    this.path = path;
};

Pos.equal = (p1, p2) =>
{
    return p1 == p2;
};

Pos.peer = (p1, p2) =>
{
    return p1 != p2 && p1.slice(0, -1) == p2.slice(0, -1);
};

Pos.sub = (p1, p2) =>
{
    return p1.length > p2.length &&
           p1.substr(0, p2.length) == p2;
};

Pos.super = (p1, p2) =>
{
    return Pos.sub(p2, p1);
};

// test
{
    assert(Pos.equal('1', '1'));
    assert(Pos.peer('11', '12'));
    assert(!Pos.peer('12345', '1234'));
    assert(Pos.sub('12345', '123'));
    assert(!Pos.sub('123', '123'));
    assert(!Pos.sub('123', '1234'));
    assert(Pos.super('12', '123'));
}