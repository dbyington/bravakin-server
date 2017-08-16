'use strict';

const User = require('../models/user.model');
const db = require('../db');
const UserSerializer = require('../utils/user-serializer');

module.exports.handleAuthorizeUser = async (ctx, next) => {
  const user = await getDatabaseUser(ctx.state.accessToken);
  if (user.error) ctx.throw(user.code, user.error);
  ctx.status = 200;
  ctx.body = UserSerializer.serializeWithToken(user);
};


module.exports.handleUserGet = async (ctx, next) => {
  const user = await getDatabaseUser(ctx.state.accessToken);
  if (user.error) ctx.throw(user.code, user.error);
  ctx.status = 200;
  ctx.body = UserSerializer.serialize(user);
};

module.exports.handleUserUpdate = async (ctx, next) => {
  let user = await getDatabaseUser(ctx.state.accessToken);
  if (user.error) ctx.throw(user.code, user.error);
  if (ctx.request.body.remove) {
    user = await removePreferences(user, ctx.request.body.remove);
  }
  if (ctx.request.body.add) {
    user = await addPreferences(user, ctx.request.body.add);
  }
  ctx.status = 200;
  user = await getDatabaseUser(ctx.state.accessToken);
  if (user.error) ctx.throw(user.code, user.error);
  ctx.body = UserSerializer.serialize(user);
};

module.exports.handleUnauthorizeUser = async (ctx, next) => {
  let user = await User.findOne({access_token: ctx.state.accessToken});
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

const getDatabaseUser = async (accessToken) => {
  const user = await User.findOne({access_token: accessToken}, (err, doc) => {
    if (err) console.log('error has been found', err);
  });
  if (!user['access_token']) return {error: 'unauthorized', code: 401};
  return user;
}

const addPreferences = async (user, adds) => {
  if (adds.like_tags) user.like_tags = [...new Set(user.like_tags.concat(adds.like_tags))];
  if (adds.be_like) user.be_like = [...new Set(user.be_like.concat(adds.be_like))];
  return await updateUserPref(user);
}

const updateUserPref = async (user) => {
  await User.update(
    {id: user.id},
    {$set: {be_like: user.be_like, like_tags: user.like_tags}},
    {new: true}
  );
  user = await User.findOne({id: user.id});
  user = UserSerializer.serializeWithToken(user);
  return user;
}

const removePreferences = async (user, removes) => {
  if (removes.like_tags) user.like_tags = user.like_tags.filter((tag) => !removes.like_tags.includes(tag));
  if (removes.be_like) user.be_like = user.be_like.filter((name) => !removes.be_like.includes(name));
  return await updateUserPref(user);
}
module.exports._helpers = {getDatabaseUser, addPreferences, updateUserPref, removePreferences};
