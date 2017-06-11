const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Md5Hash = require('webpack-md5-hash');

module.exports = {
  output: {
    filename: '[name].[chunkhash:8].js',
  },
  module: {
    loaders: [
      {
        test: /\.s?css$/,
        loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader?-autoprefixer&importLoaders=1!postcss-loader'
        ),
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        query: {
          name: 'assets/[chunkhash:8].[ext]',
          limit: 10000,
        },
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('[name].[contenthash:8].css', {
      allChunks: true,
    }),
    new Md5Hash()
  ],
};
