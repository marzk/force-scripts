var path = require('path');

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
    },
  ],
};
