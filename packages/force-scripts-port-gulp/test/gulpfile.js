const gulp = require('gulp');
const md5 = require('../plugins/md5');

gulp.task('default', function() {
  return gulp
    .src('./filtures/**/*.js')
    .pipe(md5())
    .pipe(gulp.dest('dest'));
});
