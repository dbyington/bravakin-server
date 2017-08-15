'use strict';

const User = require('../models/user.model');
const db = require('../db');
const UserSerializer = require('../middlewares/user-serializer');

module.exports.handleAuthorizeUser = async (ctx, next) => {
  const user = await getDatabaseUser(ctx.state.accessToken);
  ctx.status = 200;
  ctx.body = UserSerializer.serializeWithToken(user);
};


module.exports.handleUserGet = async (ctx, next) => {
  const user = await getDatabaseUser(ctx.state.accessToken);
  ctx.status = 200;
  ctx.body = UserSerializer.serialize(user);
};

module.exports.handleUserUpdate = async (ctx, next) => {
  let user = await getDatabaseUser(ctx.state.accessToken);
  if (ctx.body.remove) {
    user = removePreferences(user, ctx.body.remove);
  }
  if (ctx.body.add) {
    user = addPreferences(user, ctx.body.add);
  }
  ctx.status = 200;
  user = getDatabaseUser(accessToken);
  ctx.body = UserSerializer.serialize(user);
};

module.exports.handleUnauthorizeUser = async (ctx, next) => {
  const user = await User.findOne({access_token: ctx.state.accessToken});
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

  if (!user['access_token']) ctx.throw(401, 'unauthorized');
  return user;
}

const addPreferences = (user, adds) => {
  const updatedUser = Object.assign({}, user, adds);
  return updateUserPref(updatedUser);
}

const updateUserPref = async (user) => await User.update(
  {id: user.id},
  {$set: {be_like: user.be_like, like_tags: user.like_tags}},
  {new: true}
);

const removePreferences = (user, removes) => {
  user.like_tags = _.filter(user.like_tags, (tag) => !_.includes(removes.like_tags, tag));
  user.be_like = _.filter(user.be_like, (name) => !_.includes(removes.be_like, name));
  return updateUserPref(user);
}
