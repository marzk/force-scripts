var path = require('path');
var fs = require('fs');

var ROOT = process.cwd();

var configPath = path.join(ROOT, 'force-scripts.config.js');

if (!fs.existsSync(configPath)) {
  console.error(configPath, '不存在');
  process.exit(1);
}

module.exports = () => require(configPath);
