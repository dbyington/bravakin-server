'use strict';

require('dotenv').config();
const request = require('request-promise');

const UserSerializer = require('../utils/user-serializer');
const User = require('../models/user.model');
const db = require('../db');

async function _getAccessToken (ctx) {

  const form = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: 'http://localhost:3000/authorize',
    code: ctx.query.code
  };

  const postOptions = {
    url: process.env.URL,
    method: 'POST',
    form: form,
    json: true
  };
  let responseBody = await request.post(postOptions)
    .then(async data => {
      if (!data.user.id) ctx.throw(401, 'unauthorized');
      let user = await User.findOne({id: data.user.id});
      if (user) {
        await User.update(
          {id: user['id']},
          {$set: {access_token: data['access_token']}},
          {new: true},
          function (err, d) {
            if (err) ctx.throw(501, JSON.stringify({error: {status: 501, error_message: err}}));
          }
        );
        user = await User.findOne({id: data.user.id});
      } else {
        const newUser = new User({
          access_token: data.access_token,
          id: data.user.id,
          username: data.user.username,
          full_name: data.user.full_name,
          profile_picture: data.user.profile_picture
        });
        try {
          user = await newUser.save();
        } catch (e) {
          ctx.throw(500, JSON.stringify({error: {status: 500, error_message: e}}));
        }
      }
      ctx.state.accessToken = user.access_token;
      return user;
    })
    .catch( err => {
      ctx.throw(401, 'unauthorized sucka', err);
    });
  ctx.status = 200;
  ctx.body = UserSerializer.serializeWithToken(responseBody);
}

async function checkAuth (ctx, next) {
  if (ctx.query && ctx.query.code) {
    await _getAccessToken(ctx);
  } else if (!ctx.header.authorization) {
    ctx.throw(401, 'unauthorized');
  }
  if (!ctx.state.accessToken) {
    const user = User.find({access_token: accessToken});
    if (!user['access_token']) {
      // not a valid access_token
      ctx.throw(401, 'unauthorized');
    }
    ctx.state.accessToken = accessToken;
  }
  next();
}

module.exports = checkAuth;
