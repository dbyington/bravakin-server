'use strict';

const User = require('../models/user.model');
const db = require('../db');

module.exports.handleAuthorizeUser = async (ctx, next) => {
  const accessToken = ctx.status.accessToken;
  const user = User.find({access_token: accessToken});
  if (!user['access_token']) ctx.throw(401, 'unauthorized');
  ctx.status = 200;
  ctx.body = user;
};

module.exports.handleUserGet = (ctx, next) => {

};

module.exports.handleUserUpdate = (ctx, next) => {

};

module.exports.handleUnauthorizeUser = (ctx, next) => {
  ctx.status = 200;
  ctx.body = "OK";
};
