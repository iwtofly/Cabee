var fs      = require('fs');
var path    = require('path');
var url     = require('url');
var request = require('request');

var _ = module.exports = {};

_.cachePath = path.resolve(__dirname + '/../cache/');

_.fetchTimeout = 1000;

_.proxies = [];

_.servers = [];