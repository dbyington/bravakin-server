'use strict';

// it('should return 401 unauthorized if no access token or code is provided', function(){
//   const ctx = Object.assign({},mocks.ctx);
//   users.handleAuthorizeUser(ctx);
//   console.log('ctx',ctx);
//   ctx.status.should.equal(401);
//   ctx.body.should.equal('unauthorized');
// });
// it('should get and return the user object with access_token if code is provided', function() {
//   const ctx = Object.assign({}, mocks.ctx, {access_token: 'ACCESS_TOKEN'});
//   users.handleAuthorizeUser(ctx);
//   ctx.body.should.eql(mocks.authUser);
// });
