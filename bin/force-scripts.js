#!/usr/bin/env node

const fs = require('fs');
const execSync = require('child_process').execSync;
const path = require('path');

const command = process.argv[2];
const args = [].slice.call(process.argv, 3);

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
  
  execConfig(configPath);
}

function build() {
  process.env.NODE_ENV = 'production';

  const configPath = require.resolve('../tools/base.webpack.config');
  execConfig(configPath);
}

function execConfig(configPath) {
  execSync('`npm bin`/webpack ' + args.concat('--bail', '--config', configPath).join(' '), {
    stdio: [0, 1, 2]
  });
}
