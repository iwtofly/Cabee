var delay = module.exports.delay = new (require('_/delay.js'));
var track = module.exports.track = new (require('_/track.js'));

module.exports.init = (conf_delay, conf_track) =>
{
    for (cidr in conf_delay)
    {
        delay.add(cidr, conf_delay[cidr]);
    }
    track.config(conf_track);
};