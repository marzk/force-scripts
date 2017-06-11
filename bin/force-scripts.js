#!/usr/bin/env node

const webpack = require('webpack');
const fs = require('fs');

const command = process.argv[2];

switch (command) {
  case 'prebuild':
    prebuild();
    break;
  case 'build':
    build();
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

    handleErrorsAndWarnings(stats);
    console.log(stats.toString({
      colors: true,
      chunks: false,
    }));

    console.log('prebuild done');
  });
}

function build() {
  process.env.NODE_ENV = 'production';

  console.log(webpack(require('../tools/base.webpack.config')));
  webpack(require('../tools/base.webpack.config'), function (err, stats) {
    if (err) throw err;

    handleErrorsAndWarnings(stats);
    console.log(stats.toString({
      colors: true,
      chunks: false,
    }));

    console.log('build done');
  });
}


function handleErrorsAndWarnings(stats) {
  let json;
  if (stats.hasErrors()) {
    json = stats.toJson();
    console.error(stats.errors);
  }
  if (stats.hasWarnings()) {
    json = json ? json : stats.toJson();
    console.warn(stats.warnings);
  }
}
