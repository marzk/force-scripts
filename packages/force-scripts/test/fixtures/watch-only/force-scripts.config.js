var path = require('path');
const webpack = require('webpack');

module.exports = {
  root: __dirname,
  publicPath: '/__static/',
  isProd: process.env.NODE_ENV === 'production',
  buildFolder: 'build',
  configs: [
    {
      configType: 'webpack',
      name: 'turbo',
      src: './webpack',
      dest: 'static',
      entryRules: [
        [
          'app/*.js',
          files => files.filter(file => file.indexOf('node_modules') === -1),
        ],
      ],
      libEntry: 'lib.js',

      entry: {
        commons: './common',
      },
      plugins: [
        new webpack.optimize.CommonsChunkPlugin({
          name: 'commons',
          filename: 'commons.js',
        }),
        new webpack.optimize.CommonsChunkPlugin('common1'),
      ],
    },
    {
      configType: 'gulp',
      src: './gulp',
      dest: 'static',
      tasks(gulp, src, dest, manifest) {
        gulp.task('jpg', function() {
          return src('./**/*.jpg')
            .pipe(manifest())
            .dest();
        });
        gulp.task('minjpg', ['jpg'], function() {
          return src('./**/*.jpg')
            .pipe(manifest())
            .dest();
        });
        // 封装gulp.src与dest方法
        // return src('./**/*.jpg').manifest().dest();
      },
    },
  ],
};
