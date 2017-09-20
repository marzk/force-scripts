const webpack = require('webpack');
const CaseSensitivePlugin = require('case-sensitive-paths-webpack-plugin');
const progressHandler = require('./progress-handler');

module.exports = {
  output: {
    path: '/',
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          'css-loader?-autoprefixer&importLoaders=1',
          'postcss-loader',
        ],
      },
    ],
  },
  devtool: 'eval',
  plugins: [
    new webpack.ProgressPlugin(progressHandler),
    new CaseSensitivePlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
