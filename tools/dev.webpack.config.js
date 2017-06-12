const webpack = require('webpack');
const CaseSensitivePlugin = require('case-sensitive-paths-webpack-plugin');
const progressHandler = require('./progress-handler');

module.exports = {
  output: {
    path: '/',
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.s?css$/,
        loader:'style-loader!css-loader?-autoprefixer&importLoaders=1!postcss-loader',
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        query: {
          name: 'assets/[path][name].[ext]?[hash]',
          limit: 10000,
        },
      },
    ],
  },
  devtool: 'eval',
  plugins: [
    new webpack.ProgressPlugin(progressHandler),
    new CaseSensitivePlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
};
