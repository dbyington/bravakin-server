const router = require('koa-router')();
const performanceController = require('./controllers/performance.controller');
const mediaController = require('./controllers/media.controller');
const usersController = require('./controllers/users.controller');

router
  .get('/authorize', usersController.authorizeUser)
  .get('/me/activity', function (ctx, next) {
    ctx.body = 'Hello user!';
  })
  .get('/me', usersController.getUser)
  .get('/tags/:tag_name', mediaController.getMediaByTag)
  .get('/performance/:id', performanceController.mediaStats)
  .get('/performance', performanceController.userStats)
  .get('/influence/:id', function (ctx, next) {
    ctx.body = 'Hello influence id!';
  })
  .get('/influence', usersController.userInfluence)
  .put('/unauthorize', usersController.unauthorizeUser)
  .put('/me', usersController.updateUser)
  .post('/media/like', mediaController.likeMedia);

module.exports = router;
