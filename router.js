const router = require('koa-router')();
const performanceController = require('./controllers/performance.controller');
const userController = require('./controllers/users.controller');

router
  .get('/authorize', function (ctx, next) {
    ctx.redirect(`http://localhost:3001/routeHere?access_token=${ctx.state.accessToken}`);
  })
  .get('/me/activity', function (ctx, next) {
    ctx.body = 'Hello user!';
  })
  .get('/me', userController.getUser)
  .get('/tags/:tag_name', function (ctx, next) {
    // scraper
    ctx.body = 'Hello tag name!';
  })
  .get('/media/:id', function (ctx, next) {
    ctx.body = 'Hello media id!';
  })
  .get('/performance/:id', performanceController.mediaStats)
  .get('/performance', performanceController.userStats)
  .get('/influence/:id', function (ctx, next) {
    ctx.body = 'Hello influence id!';
  })
  .get('/influence', function (ctx, next) {
    // scraper
    ctx.body = 'Hello influence!';
  })
  .put('/unauthorize', userController.unauthorizeUser)
  .put('/me', userController.updateUser)
  .put('/media/:id/like', function (ctx, next) {
    // scraper
    ctx.body = 'Update changing my mind on the like!';
  });

module.exports = router;
