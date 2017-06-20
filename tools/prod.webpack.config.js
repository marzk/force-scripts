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
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            'postcss-loader',
          ],
        }),
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|eot|ttf|otf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: 'assets/[hash:8].[ext]',
              limit: 10000,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].[contenthash:8].css',
      allChunks: true,
    }),
    new Md5Hash(),
  ],
};
