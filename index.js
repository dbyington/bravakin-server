const Koa = require('koa');
const logger = require('koa-logger');
const body = require('koa-body');
const cors = require('kcors');
const router = require('./router');
const checkAuth = require('./middleware/authentication');
const app = new Koa();

app
  .use(logger())
  .use(cors())
  .use(body())
  .use(checkAuth())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
