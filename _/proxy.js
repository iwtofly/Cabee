let mod = module.exports = function(conf, caches = {})
{
    this.conf   = conf;
    this.caches = caches;
};

mod.fromJson = function(json)
{
    return new mod(json.conf, json.caches);
};

mod.prototype.has = function(cache)
{
    return this.caches[cache.ip].length > 0 &&
           this.caches[cache.ip][cache.port] > 0 &&
           this.caches[cache.ip][cache.port][cache.video] > 0 &&
           this.caches[cache.ip][cache.port][cache.video][cache.piece] != undefined;
};