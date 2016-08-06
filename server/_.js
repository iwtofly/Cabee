var delay  = module.exports.delay = new (require('_/delay'));
var track  = module.exports.track = new (require('_/link'));
var config = module.exports.config = {};

module.exports.init = (conf) =>
{
    config = conf;
    for (cidr in conf.delay)
    {
        delay.add(cidr, conf.delay[cidr]);
    }
    track.init(conf.track);
    track.connect();
};