let express = require('express');
let util    = require('util');
let Ip      = require('_/ip');
let File    = require('_/file');
let Slice   = require('./model/slice');

//
// this module handles the pull when proxy relay a request from user
// when user request slice [shit/1.jpg], and server has shit/[1,2,3,4,5].jpg, we will try to fetch other slices
//
let mod = module.exports = function(app)
{
    this.app = app;
};

mod.prototype.on_push = function(server_info, video, piece)
{
};