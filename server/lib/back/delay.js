var express = require('express');
var share   = require('./share.js');
var router  = express.Router();
var ip      = require('ip');

module.exports = router;

router.route('/delay')
.get(function(req, res)
{
    res.render('delay.j2', {'list' : share.delay_list});
})
.post(function(req, res)
{
    var addr = req.body['addr'];
    var mask = req.body['mask'];
    var time = req.body['time'];

    var list = [];

    if (addr && !(addr instanceof Array))
    {
        addr = [addr];
        mask = [mask];
        time = [time];
    }

    for (var i = 0; i < addr.length; i++)
    {
        time[i] = parseInt(time[i]);

        if (ip.isV4Format(addr[i]) && ip.isV4Format(mask[i]) && time[i] >= 0 && time[i] <= 99999)
        {
            list.push(
            {
                'addr' : addr[i],
                'mask' : mask[i],
                'time' : time[i]
            });
        }
    }

    share.delay_list = list;
    share.log('ip-delay edited : ' + JSON.stringify(list));

    res.render('delay.j2', {'list' : list});
});