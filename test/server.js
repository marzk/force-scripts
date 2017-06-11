const Koa = require('koa');
const middleware = require('../');

const app = new Koa();

app.use(middleware());

app.listen(3000);
