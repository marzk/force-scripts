var path = require('path');
var fs = require('fs');
const loadConfig = require('./loadConfig');

var baseConfigFactory = require('./tools/base.webpack.config');
var libConfigFactory = require('./tools/lib.webpack.config');

const forceConfig = loadConfig();

const webpackConfigs = baseConfigFactory(forceConfig);
// const libConfigs = libConfigFactory(forceConfig);
console.log(webpackConfigs);
// console.log(libConfigs);

module.exports = webpackConfigs;
