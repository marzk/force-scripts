var path = require('path');
const webpack = require('webpack');

module.exports = {
  publicPath: '/__static/',
  isProd: process.env.NODE_ENV === 'production',
  configs: [
    {
      name: 'turbo',
      src: '.',
      dest: 'static',
      entryRules: [
        ['app/*.js', files => files.filter(file => file.indexOf('node_modules') === -1)],
      ],
      libEntry: 'lib.js',
      entry: {
        commons: './common',
      },
      plugins: [
        new webpack.optimize.CommonsChunkPlugin({
          name: 'commons',
          filename: 'commons.js'
        }),
        new webpack.optimize.CommonsChunkPlugin('common1')
      ],
    },
    {
      name: 'mobile',
      src: '.',
      dest: 'static',
      entryRules: './asset.js',
      disableLoaders: true,
      libEntry: 'lib.js',
      module: {
        loaders: [
          {
            test: /\.(css|png|jpg)$/,
            loader: 'file-loader',
            include: [
              path.join(__dirname, 'assets'),
            ],
            query: {
              context: __dirname,
              name:  '[path][name].[hash:8].[ext]',
            },
          }
        ],
      }
    }
  ],
};
