const path = require('path');
const fs = require('fs');
const merge = require('webpack-merge');

const ROOT = process.cwd();

const configPath = path.join(ROOT, 'force-scripts.config.js');

if (!fs.existsSync(configPath)) {
  console.error(configPath, '不存在');
  process.exit(1);
}

const forceConfig = require(configPath);

if (typeof forceConfig.baseConfig === 'object') {
  forceConfig.configs = forceConfig.configs.map(config =>
    merge(forceConfig.baseConfig, config)
  );
}

// 是否开启内置热替换
forceConfig.hot = 'hot' in forceConfig ? forceConfig.hot : !forceConfig.isProd;

module.exports = () => forceConfig;
