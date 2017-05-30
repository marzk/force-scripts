const middleware = require('force-scripts-middleware');
const webpack = require('webpack');

const webpackConfig = require('./tools/base.webpack.config');

module.exports = middleware(webpack(webpackConfig, {
  stats: {
    colors: true,
    chunks: false
  },
}));
