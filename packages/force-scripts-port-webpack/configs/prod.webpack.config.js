const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  output: {
    filename: '[name].[chunkhash:8].js',
    chunkFilename: '[name].[chunkhash:8].js',
  },
  module: {
    loaders: [
      {
        test: /\.s?css$/,
        loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader?-autoprefixer&importLoaders=1!postcss-loader'
        ),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('[name].[contenthash:8].css', {
      allChunks: true,
    }),
  ],
};
