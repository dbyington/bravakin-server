'use strict';
require('dotenv').config();
// const fetch = require('node-fetch');
const request = require('request-promise');

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
  console.log('post options:',postOptions);
  let responseBody = await request.post(postOptions)
    .then(async data => {
      console.log('access token reply', data);
      if (!data.user.id) ctx.throw(401, 'unauthorized');
      let user = await User.findOne({id: data.user.id});
      console.log('user:',user);
      if (user) {
        console.log('update access token:', user['id'], data['access_token']);
        user = await User.update(
          {id: user['id']},
          {$set: {access_token: data['access_token']}},
          {new: true},
          function (err, d) {
            if (err) ctx.throw(500, JSON.stringify({error: {status: 500, error_message: err}}));
            return d;
          }
        );
      } else {
        const newUser = new User({
          access_token: data.access_token,
          id: data.user.id,
          username: data.user.username,
          full_name: data.user.full_name,
          profile_picture: data.user.profile_picture
        });
        try {
          console.log('save new user:', newUser);
          user = await newUser.save();
        } catch (e) {
          ctx.throw(500, JSON.stringify({error: {status: 500, error_message: e}}));
        }
      }
      ctx.state.accessToken = user.access_token;
      console.log('token:',ctx.state.accessToken);
      return user;
    })
    .catch( err => {
      ctx.throw(401, 'unauthorized sucka', err);
    });
  ctx.status = 200;
  ctx.body = responseBody;
}

async function checkAuth (ctx, next) {
  console.log('check for params code and header.authorization');
  if (ctx.query && ctx.query.code) {
    console.log(ctx.query.code);
    await _getAccessToken(ctx);
  } else if (!ctx.header.authorization) {
    ctx.throw(401, 'unauthorized');
  }
  // made it through the gaunlet, check the access_token

  // const accessToken = ctx.header.authorization.split(' ')[1];
  if (!ctx.state.accessToken) {
    console.log('accessToken not defined');
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
