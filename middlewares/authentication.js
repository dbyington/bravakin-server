'use strict';
require('dotenv').config();
const fetch = require('node-fetch');
const request = require('request-promise');
const User = require('../models/user.model');

const User = require('../models/user.model');
const db = require('../db');

const _getAccessToken = (ctx) => {
  const form = {
    client_id = process.env.CLIENT_ID,
    client_secret = process.env.CLIENT_SECRET,
    grant_type = 'authorization_code',
    redirect_uri = 'https://me/authorize',
    code = ctx.params.code
  };

  const postOptions = {
    url: process.env.URL,
    method: 'POST',
    form: form
  }
  let responseBody = await request.post(postOptions)
  .then(data => {
    data = JSON.parse(data);
    if (!data.user.id) ctx.throw(401, 'unauthorized');

    // insert or update user with access_token
    // create complete user object to return
    let user = await User.findOne({id: data.user.id});
    if (user.id) { // user found, update the access_token
      user = await User.findByIdAndUpdate(user._id,
        { $set: {access_token: data.access_token}},
        {new: true},
        function(err, d) {
          if (err) ctx.throw(500, JSON.stringify({error: {status: 500, error_message: err}}));
          return d;
        }
      );
    } else {
      const newUser = new User(
        access_token: data.access_token,
        id: data.user.id,
        username: data.user.username,
        full_name: data.user.full_name,
        profile_picture: data.user.profile_picture
      );
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
    ctx.throw(401, 'unauthorized');
  });

  ctx.status = 200;
  ctx.body = responseBody;
}

modules.exports.checkAuth = async (ctx, next) => {
  console.log('check for params code and header.authorization');
  if (ctx.params.code) {
    _getAccessToken(ctx);
  } else if (!ctx.header.authorization) {
    ctx.throw(401, 'unauthorized');
  }
  // made it through the gaunlet, check the access_token
  const accessToken = ctx.header.authorization.split(' ')[1];
  const user = User.find({access_token: accessToken});
  if (!user['access_token']) {
    // not a valid access_token
    ctx.throw(401, 'unauthorized');
  }
  ctx.state.accessToken = accessToken;
  next();
}
