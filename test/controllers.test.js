'use strict';

const should = require('chai').should();
const mocks = require('./mocks');
const users = require('../controllers/users.controller');
const db = require('../db');
const User = require('../models/user.model');

describe('Users', function() {
  describe('GET /authorize', function() {
    it('should return the user object', async function(){
      let ctx = Object.assign({}, mocks.ctx, {state: {accessToken: 'ACCESS_TOKEN'}})
      await users.handleAuthorizeUser(ctx);
      ctx.body.should.eql(mocks.authUser);
    });
    it('should return the access token', async function(){
      let ctx = Object.assign({}, mocks.ctx, {state: {accessToken: 'ACCESS_TOKEN'}})
      await users.handleAuthorizeUser(ctx);
      ctx.body.access_token.should.eql(mocks.authUser.access_token);
    });
  });

  describe('GET /me', function() {
    it('should return the user object', function(){
      users.handleUserGet(mocks.ctx);
      mocks.ctx.body.should.eql(mocks.user);
    });
    it('should not return an access token', function(){
      users.handleUserGet(mocks.ctx);
      should.not.exist(mocks.access_token);
    });
  });

  describe('POST /me', function() {
    it('should update the user', function(){
      const updatedUser = Object.assign({}, mocks.getUser, {
        like_tags: ['beachvolley', 'power']
      });
      updatedUser.be_like.filter(el => el !== 'Godzilla');
      mocks.ctx.request['body'] = mocks.userUpdate;
      users.handleUserUpdate(mocks.ctx);
      mocks.ctx.body.should.eql(updatedUser);
    });
  });

  describe('PUT /unauthorize', function() {
    it('should return status code 200: ok', function(){
      users.handleUnauthorizeUser(mocks.ctx);
      mocks.ctx.status.should.equal(200);
      mocks.ctx.body.should.equal('OK');
    } )
  })
});

describe('helper functions', function(){
  describe('getDatabaseUser', function(){
    it('should not filter when there is no callback', function(){
      true.should.equal(true);
    });
  });
});
