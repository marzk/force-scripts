const forceConfig = require('./load-config')();

let fs;

if (forceConfig.isProd) {
  fs = require('fs');
} else {
  const mfs = require('memory-fs');
  fs = new mfs();
}

module.exports = fs;
