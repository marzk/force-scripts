var path = require('path');

module.exports = [
  {
    src: 'client',
    dest: 'static',
    entryRules: [
      ['page/**/index.js?(x)', path => path.indexOf('node_modules') === -1],
    ],
    publicPath: '__static',
  }
];
