const webpackConfig = require('./tools/base.webpack.config');
const fs = require('./fs');
const webpack = require('webpack');

module.exports = function genCompiler() {
  compiler = webpack(webpackConfig);
  compiler.outputFileSystem = fs;

  return compiler;
};
