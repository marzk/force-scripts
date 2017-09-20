import path = require('path');
import fs = require('fs');

const ROOT = process.cwd();

const configPath = path.join(ROOT, 'force-scripts.config.js');

if (!fs.existsSync(configPath)) {
  console.error(configPath, '不存在');
  process.exit(1);
}

export default <ForceConfig>require(configPath);
