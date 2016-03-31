var request = require('request');

module.exports = server;

function server(ip, interval)
{
    this.ip    = ip;
    this.delay = 'unreachable';
};