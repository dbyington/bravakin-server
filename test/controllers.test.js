'use strict';

const should = require('chai').should();
const mocks = require('./mocks');
const users = require('../controllers/users.controller');
const User = require('../models/user.model');

let ctx;

beforeEach(async function () {
  ctx = Object.assign({}, mocks.ctx, {state: {accessToken: 'ACCESS_TOKEN'}})
  await User.remove({id: 42});
  const user = new User(mocks.authUser);
  await user.save();
});

describe('Users', function () {
  describe('GET /authorize', function () {
    it('should return the user object', async function () {
      await users.authorizeUser(ctx);
      ctx.body.should.eql(mocks.authUser);
    });
    it('should return the access token', async function () {
      await users.authorizeUser(ctx);
      ctx.body.access_token.should.eql(mocks.authUser.access_token);
    });
  });

  describe('GET /me', function () {
    it('should return the user object', async function () {
      await users.getUser(ctx);
      ctx.body.should.eql(mocks.getUser);
    });
    it('should not return an access token', async function () {
      await users.getUser(ctx);
      should.not.exist(mocks.access_token);
    });
  });

  describe('PUT /me', function () {
    it('should update the user', async function () {
      await User.update({accessToken: 'ACCESS_TOKEN'}, {$set: {like_tags: ['landscape', 'adventure'], be_like: ['Yahweh', 'The Messiah', 'Godzilla']}}, {new: true});
      const updatedUser = Object.assign({}, mocks.getUser, {
        like_tags: ['beachvolley', 'power']
      });
      updatedUser.be_like.filter(el => el !== 'Godzilla');
      ctx.request['body'] = mocks.userUpdate;
      await users.updateUser(ctx);
      ctx.body.should.eql(mocks.modifiedUser);
    });
  });

  describe('PUT /unauthorize', function () {
    it('should return status code 200: ok', async function () {
      await users.unauthorizeUser(ctx);
      ctx.status.should.equal(200);
      ctx.body.should.equal('OK');
    });
  });
});

describe('helper functions', function () {
  describe('getDatabaseUser', function () {
    it('should return valid user with valid access_token', async function () {
      const user = await users._helpers.getDatabaseUser(ctx.state.accessToken);
      user.id.should.equal(42);
      user.access_token.should.equal('ACCESS_TOKEN');
    });
  });

  describe('addPreferences', function () {
    it('should return valid user with the be like and add tags', async function () {
      const adds = {like_tags: ['stuff']};
      const beLike = {be_like: ['Kevin']};
      let user = await users._helpers.addPreferences(mocks.getUser, adds);
      user.like_tags.should.include('stuff');
      user = await users._helpers.addPreferences(mocks.getUser, beLike);
      user.be_like.should.include('Kevin');
      const addingMultiplePrefs = {like_tags: ['Tennis'], be_like: ['Travis']};
      user = await users._helpers.addPreferences(mocks.getUser, addingMultiplePrefs);
      user.be_like.should.include('Travis');
      user.like_tags.should.include('Tennis');
    });
  });

  describe('removePreferences', function () {
    it('should return valid user having removed be like and add tags', async function () {
      const remove = {like_tags: ['adventure']};
      const beLike = {be_like: ['Godzilla']};
      let user = await users._helpers.removePreferences(mocks.getUser, remove);
      user.like_tags.should.not.include('adventure');
      user = await users._helpers.removePreferences(mocks.getUser, beLike);
      user.be_like.should.not.include('Godzilla');
    });
  });
});
