var path = require('path');

module.exports = {
  publicPath: '/__static/',
  configs: [
    {
      src: '.',
      dest: 'static',
      entryRules: [
        ['app/*.js', path => path.indexOf('node_modules') === -1],
      ],
      entryCb(key, entry) {
        console.log(key, entry);
        return entry;
      },
      libEntry: 'lib.js',
    },
  ],
};
