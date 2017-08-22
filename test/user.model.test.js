const mocks = require('./mocks.js');
const db = require('../db');
const User = require('../models/user.model');
const expect = require('chai').expect;
const should = require('chai').should;

describe('encrypt favorite', function () {
  it('should return an encryption of the instagram favorite', async function () {
    const favoriteTest = Object.assign({}, mocks.encryptionTestUser)
    const newUser = new User(favoriteTest);
    await newUser.save();
    const savedUser = await User.findOne({'_id': newUser._id});
    savedUser.favorite.should.not.equal(mocks.encryptionTestUser.cake);
  });
  it('should delete the raw password', async function () {
    const favoriteTest = Object.assign({}, mocks.encryptionTestUser)
    const newUser = new User(favoriteTest);
    await newUser.save();
    const savedUser = await User.findOne({'_id': newUser._id});
    expect(savedUser.cake).to.be.undefined;
  });
});
