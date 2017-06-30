const Koa = require('koa');
const middleware = require('../');

const app = new Koa();

app.use(middleware({}));

app.use(function*(next) {
  this.body = this.getUrlFromFile('assets/level1/test.png');
});

app.listen(3000);
