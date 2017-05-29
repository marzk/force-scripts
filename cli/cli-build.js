process.env.NODE_ENV = 'production';
var webpack = require('webpack');

webpack(require('../tools/base.webpack.config'), function (err, stats) {
  if (err) throw err;

  console.log(stats.toString({
    colors: true,
    chunks: false,
  }));

  console.log('build done');
});

