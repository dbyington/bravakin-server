const mocks = require('./mocks.js');
const User = require('../models/user.model');
const db = require('../db');
const expect = require('chai').expect;

describe('encrypt favorite', function() {

  it('should return an encryption of the instagram favorite', async function(){
    const favoriteTest = Object.assign({}, mocks.encryptionTestUser)
    const newUser = new User(favoriteTest);
    await newUser.save();
    const savedUser = await User.findOne({'_id': newUser._id});
    savedUser.favorite.should.not.equal(mocks.encryptionTestUser.cake);
  });
  it('should delete the raw password', async function(){
    const favoriteTest = Object.assign({}, mocks.encryptionTestUser)
    const newUser = new User(favoriteTest);
    await newUser.save();
    const savedUser = await User.findOne({'_id': newUser._id});
    expect(savedUser.cake).to.be.undefined;
  });
});
