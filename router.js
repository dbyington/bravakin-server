const router = require('koa-router')();
const performanceController = require('./controllers/performance.controller');
const mediaController = require('./controllers/media.controller');
const usersController = require('./controllers/users.controller');

router
  .get('/authorize', function (ctx, next) {
    ctx.redirect(`http://localhost:3001/routeHere?access_token=${ctx.state.accessToken}`);
  })
  .get('/me/activity', function (ctx, next) {
    ctx.body = 'Hello user!';
  })
  .get('/me', usersController.getUser)
  .get('/tags/:tag_name', mediaController.getMediaByTag)
  .get('/media/:url:/like', function (ctx, next) {
    ctx.body = 'Hello media id!';
  })
  .get('/performance/:id', performanceController.mediaStats)
  .get('/performance', performanceController.userStats)
  .get('/influence/:id', function (ctx, next) {
    ctx.body = 'Hello influence id!';
  })
  .get('/influence', usersController.userInfluence)
  .put('/unauthorize', usersController.unauthorizeUser)
  .put('/me', usersController.updateUser)
  .put('/media/:id/like', function (ctx, next) {
    // scraper
    ctx.body = 'Update changing my mind on the like!';
  });

module.exports = router;
