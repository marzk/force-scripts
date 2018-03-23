// 负责启动port-webpack

const CWD = process.cwd();

const yargs = require('yargs');

const yargv = yargs
  .usage('$0 <cmd> [args]')
  .command('build', 'webpack build', {}, argv => {
    console.log(argv);
  })
  .command('watch')
  .command('dev')
  .boolean('prod')
  .option('config', {
    default: 'force-scripts.config.js',
  })
  .help().argv;
