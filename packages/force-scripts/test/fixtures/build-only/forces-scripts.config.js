module.exports = {
  root: __dirname,
  publicPath: '/__static/',
  isProd: true,
  configs: [
    {
      configType: 'webpack',
      name: 'build-only',
      src: 'src',
      dest: 'dest',
      entryRules: [['entry.js']],
    },
  ],
};
