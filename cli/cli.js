var program = require('commander');
var pacakge = require('../package.json');

program
  .version(pacakge.version)
  .command('prebuild', 'pre build libs')
  .command('build', 'build assets')
  .parse(process.argv);
