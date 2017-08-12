const should = require('chai').should;
const mocks = require('./mocks');
const users = require('../controllers/users.controller');

describe('Users', function() {
  describe('GET /login', function() {
    it('should return the user object', function(){
      users.handleUserLogin(mocks.ctx);
      mocks.ctx.body.should.eql(mocks.user);
    });
    it('should return the access token', function(){
      users.handleUserLogin(mocks.ctx);
      mocks.ctx.body.data.access_token.should.eql(mocks.access_token);
    });
    it('should redirect if no access token is provided', function(){
      users.handleUserLogin(mocks.ctx);
      ctx.redirect.called.should.be(true);
    });
  });
  
  describe('GET /user', function() {
    it('should return the user object', function(){
      users.handleUserGet(mocks.ctx);
      mocks.ctx.body.should.eql(mocks.user);
    });
    it('should not return an access token', function(){
      users.handleUserGet(mocks.ctx);
      should.not.exisit(mocks.access_token);
    });
  });

  describe('POST /user', function() {
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

  describe('PUT /logout', function() {
    it('should return status code 200: ok', function(){
      users.handleUserLogout(mocks.ctx);
      mocks.ctx.status.should.be(200);
      mocks.ctx.body.should.be('OK');
    } )
  })

});
