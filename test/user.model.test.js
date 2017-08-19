const mocks = require('./mocks.js');
const User = require('../models/user.model');
const db = require('../db');


describe('encrypt favorite', function() {
  it('should return an encryption of the instagram favorite', async function(){
    const favoriteTest = Object.assign({}, mocks.user, {favorite: 'Mr.Ward'})
    const newUser = new User(favoriteTest);
    await newUser.save();
    const savedUser = await User.findOne({id: mocks.user.id}, {favorite:1, _id:0});
    savedUser.favorite.should.not.equal('Mr.Ward');
  });
});
