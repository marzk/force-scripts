var webpack = require('webpack');

webpack(require('../tools/lib.webpack.config'), function (err, stats) {
  if (err) throw err;

  console.log(stats.toString({
    colors: true,
    chunks: false,
  }));

  console.log('prebuild done');
});
