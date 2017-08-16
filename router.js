const router = require('koa-router')();

router
  .get('/authorize', function (ctx, next) {
    ctx.body = 'Hello Login!';
  })
  .get('/me/activity', function (ctx, next) {
    ctx.body = 'Hello activity!';
  })
  .get('/me', function (ctx, next) {
    ctx.body = 'Hello user!';
  })
  .get('/tags/:tag_name', function (ctx, next) {
    ctx.body = 'Hello tag name!';
  })
  .get('/media/:id', function (ctx, next) {
    ctx.body = 'Hello media id!';
  })
  .get('/performance/:id', function (ctx, next) {
    ctx.body = 'Hello performance id!';
  })
  .get('/performance', function (ctx, next) {
    ctx.body = 'Hello performance!';
  })
  .get('/influence/:id', function (ctx, next) {
    ctx.body = 'Hello influence id!';
  })
  .get('/influence', function (ctx, next) {
    ctx.body = 'Hello influence!';
  })
  .put('/unauthorize', function (ctx, next) {
    ctx.body = 'Goodbye Logout!';
  })
  .put('/me', function (ctx, next) {
    ctx.body = 'Update user!';
  })
  .put('/media/:id/like', function (ctx, next) {
    ctx.body = 'Update changing my mind on the like!';
  });

module.exports = router;
