let path = require('path');

let cache = module.exports = function(dir, ip, port, video, piece)
{
    this.ip    = ip;
    this.port  = port;
    this.video = video;
    this.piece = piece;
    this.url   = 'http://' + ip + ':' + port + '/video/' + video + '/' + piece;
    this.path  = path.join(dir, ip, port, video, piece);
};