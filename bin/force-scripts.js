#!/usr/bin/env node

const webpack = require('webpack');
const fs = require('fs');
const execSync = require('child_process').execSync;
const path = require('path');

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
  const configPath = require.resolve('../tools/lib.webpack.config');
  execSync('`npm bin`/webpack --verbose --progress --bail --profile --config ' + configPath, {
    stdio: [0, 1, 2]
  });
}

function build() {
  process.env.NODE_ENV = 'production';

  const configPath = require.resolve('../tools/base.webpack.config');
  execSync('`npm bin`/webpack --verbose --progress --bail --profile --config ' + configPath, {
    stdio: [0, 1, 2]
  });
}
