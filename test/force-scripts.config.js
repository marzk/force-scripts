var path = require('path');
const webpack = require('webpack');

module.exports = {
  publicPath: '/__static/',
  configs: [
    {
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
        })
      ],
    },
  ],
};
