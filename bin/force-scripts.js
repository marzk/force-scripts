#!/usr/bin/env node

const webpack = require('webpack');

const command = process.argv[2];

switch (command) {
  case 'prebuild':
    prebuild();
    break;
  case 'build':
    break;
  default:
    console.error(`
      only support build or prebuild
    `);
    process.exit(1);
}

function prebuild() {
  webpack(require('../tools/lib.webpack.config'), function (err, stats) {
    if (err) throw err;

    console.log(stats.toString({
      colors: true,
      chunks: false,
    }));

    console.log('prebuild done');
  });
}

function build() {
  process.env.NODE_ENV = 'production';

  webpack(require('../tools/base.webpack.config'), function (err, stats) {
    if (err) throw err;

    console.log(stats.toString({
      colors: true,
      chunks: false,
    }));

    console.log('build done');
  });
}
