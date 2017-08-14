'use strict';

const User = require('../models/user.model');
const db = require('../db');
const _ = require('lodash');

module.exports.handleAuthorizeUser = async (ctx, next) => {
  const user = await getFilteredUser(ctx.status.accessToken);
  ctx.status = 200;
  ctx.body = user;
};


module.exports.handleUserGet = async (ctx, next) => {
  const user = await getFilteredUser(ctx.status.accessToken, filterAccessToken);
  ctx.status = 200;
  ctx.body = user;
};

module.exports.handleUserUpdate = async (ctx, next) => {
  let user = await getFilteredUser(ctx.status.accessToken);
  if (ctx.body.remove) {
    user = removePreferences(user, ctx.body.remove);
  }
  if (ctx.body.add) {
    user = addPreferences(user, ctx.body.add);
  }
  ctx.status = 200;
  ctx.body = getFilteredUser(accessToken, filterAccessToken);
};

module.exports.handleUnauthorizeUser = async (ctx, next) => {
  const user = await User.findOne({access_token: ctx.status.accessToken});
  user = await User.findByIdAndUpdate(user._id,
    { $set: {access_token: ''}},
    {new: true},
    function(err, d) {
      if (err) ctx.throw(500, JSON.stringify({error: {status: 500, error_message: err}}));
      return d;
    }
  );
  ctx.status = 200;
  ctx.body = "OK";
};

const getFilteredUser = async (accessToken, filterCallback) => {
  let user = await User.find({access_token: accessToken});
  if (!user['access_token']) ctx.throw(401, 'unauthorized');
  if(typeof filterCallback === 'function') {
    user = _.filter(user, filterCallback);
  }
  return user;
}

const filterAccessToken = (u) => !u.access_token;

const addPreferences = (user, adds) => {
  return Object.assign({}, user, adds);
}

const removePreferences = (user, removes) => {
  user.like_tags = _.filter(user.like_tags, (tag) => !_.includes(removes.like_tags, tag));
  user.be_like = _.filter(user.be_like, (name) => !_.includes(removes.be_like, name));
  return user;
}
