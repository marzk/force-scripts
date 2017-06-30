const forceConfig = require('./load-config')();

let fs;

if (forceConfig.isProd) {
  const mfs = require('memory-fs');
  fs = new mfs();
} else {
  fs = require('fs');
}

module.exports = fs;
