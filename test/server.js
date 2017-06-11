const Koa = require('koa');
const middleware = require('../');

const app = new Koa();

app.use(middleware());

app.use(function* (next) {
  this.body = {
    code: 200, 
  };
});

app.listen(3000);
