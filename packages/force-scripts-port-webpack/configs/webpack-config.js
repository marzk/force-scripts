const _ = require('lodash');
const merge = require('webpack-merge');
const path = require('path');

class WebpackConfig {
  constructor(
    rawConfig,
    fileList,
    { name, root, src, dest, isProd = false, publicPath }
  ) {
    this.rawConfig = rawConfig;
    this.fileList = fileList;
    this.entry = this.getEntry(this.fileList);
    this.root = root;
    this.src = src;
    this.dest = dest;
    this.absSrc = path.join(root, src);
    this.absDest = path.join(root, dest);
    this.index = WebpackConfig.count++;
    this.name = name || `${this.index}`;
    this.publicPath = publicPath;
    this.isProd = isProd;

    this.configName = `force-scripts-webpack-${this.name}`;
  }

  get config() {
    return this.getConfig();
  }

  getConfig() {
    const config = merge(
      this.baseConfig(),
      this.specificConfig(),
      this.customConfig()
    );

    const { configCb } = this.rawConfig;

    return typeof configCb === 'function' ? configCb(config) : config;
  }

  baseConfig() {
    return {
      context: this.root,
      name: this.configName,
      entry: this.entry,
      output: {
        publicPath: this.publicPath,
        path: this.absDest,
      },
      resolve: {
        extensions: ['', '.js', '.jsx'],
      },
    };
  }
  customConfig() {
    return _.omit(this.rawConfig, WebpackConfig.metaKeys);
  }

  getEntry() {
    if (this.getType(this.fileList) === 'Object') {
      return this.fileList;
    }
    const { entryCb } = this.rawConfig;
    return this.fileList.reduce((entryMap, file) => {
      const name = this.stripExt(path.relative(this.absSrc, file));
      const entryFile = entryCb ? entryCb(name, file) : file;
      entryMap[name] = Array.isArray(entryFile)
        ? entryFile
        : [].concat(entryFile);
      entryMap[name] = this.postProcessEntry(name, entryMap[name]);

      return entryMap;
    }, {});
  }
  getCommonLibName() {
    const configName = this.name;
    return `commonLib${configName.charAt(0).toUpperCase()}${configName.slice(
      1
    )}`;
  }
  stripExt(filename) {
    const pathObj = path.parse(filename);
    return path.join(pathObj.dir, pathObj.name);
  }
  postProcessEntry(name, entry) {
    return entry;
  }
  getType(variable) {
    return Object.prototype.toString.call(variable).slice(8, -1);
  }
}

WebpackConfig.count = 0;
WebpackConfig.metaKeys = [
  'name',
  'src',
  'dest',
  'entryRules',
  'entryCb',
  'libEntry',
  'configCb',
  'disableLoaders',
];

module.exports = WebpackConfig.default = WebpackConfig;
