const Koa = require('koa');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const cors = require('kcors');
const router = require('./router');
const checkAuth = require('./middlewares/authentication');
const db = require('./db');

const app = new Koa();
app
  .use(logger())
  .use(cors())
  .use(bodyParser())
  .use(checkAuth)
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
