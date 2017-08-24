'use strict';

require('dotenv').config();
const User = require('../models/user.model');
const UserSerializer = require('../utils/user-serializer');
const InstagramScraper = require('../utils/ig-scraper');
const crypto = require('../utils/crypto');

module.exports.authorizeUser = async (ctx, next) => {
  ctx.redirect(`${process.env.OAUTH_FRONTEND_REDIRECT}#access_token=${ctx.state.accessToken}`);
};

module.exports.getUser = async (ctx, next) => {
  const accessToken = ctx.header.authorization.split(' ')[1];
  const user = await getDatabaseUser(accessToken);
  if (user.error) ctx.throw(user.code, user.error);
  let newUser = Object.assign({}, UserSerializer.serialize(user), {followers: user['followers'].length});
  ctx.status = 200;
  ctx.body = newUser;
};

module.exports.updateUser = async (ctx, next) => {
  const accessToken = ctx.header.authorization.split(' ')[1];
  let user = await getDatabaseUser(accessToken);
  if (user.error) ctx.throw(user.code, user.error);
  if (ctx.request.body.remove) {
    user = await removePreferences(user, ctx.request.body.remove);
  }
  if (ctx.request.body.add) {
    user = await addPreferences(user, ctx.request.body.add);
  }
  if (ctx.request.body.save) {
    user.cake = ctx.request.body.save;
    user = await user.save();
  }
  ctx.status = 200;
  user = await getDatabaseUser(accessToken);
  if (user.error) ctx.throw(user.code, user.error);
  ctx.body = UserSerializer.serialize(user);
};

module.exports.unauthorizeUser = async (ctx, next) => {
  const accessToken = ctx.header.authorization.split(' ')[1];
  let user = await User.findOne({access_token: accessToken});
  user = await User.findByIdAndUpdate(user._id,
    {$set: {access_token: ''}},
    {new: true},
    function (err, d) {
      if (err) ctx.throw(500, JSON.stringify({error: {status: 500, error_message: err}}));
      return d;
    }
  );
  ctx.status = 200;
  ctx.body = 'OK';
};

module.exports.userInfluence = async (ctx, next) => {
  const accessToken = ctx.header.authorization.split(' ')[1];
  const user = await User.findOne({access_token: accessToken}, {followers: 1});
  const followers = user['followers'];
  let locations = followers.filter(f => {
    if (f.location && f.location.country) return f;
  })
    .map(f => f.location.country)
    .reduce((acc, el) => {
      const match = acc.find(fe => fe.id === el);
      if (match) {
        match['heat']++;
      } else {
        acc.push({id: el, heat: 1});
      }
      return acc;
    }, []);
  const ratio = Math.max(...locations.map(el => el.heat)) / 10;
  locations = locations.map(el => {
    el.heat = Math.round(el.heat / ratio);
    return el;
  });
  ctx.status = 200;
  ctx.body = { data: {locations: locations} };
}

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
  const returnUser = await updateUserPref(user);
  return returnUser;
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
  const returnUser = await updateUserPref(user);
  return returnUser;
}

module.exports.getRawPassword = async (user) => {
  const dbUser = await User.findOne({username: user.username}, {favorite: 1});
  return dbUser.favorite;
}

module.exports._helpers = {getDatabaseUser, addPreferences, updateUserPref, removePreferences};
