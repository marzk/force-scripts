const _ = require('lodash');
const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

const Port = require('force-scripts/port');
const DevConfig = require('./configs/dev-config');
const ProdConfig = require('./configs/prod-config');
const LibConfig = require('./configs/lib-config');

class PortWebpack extends Port {
  constructor(forceConfig, manifest) {
    super(forceConfig);
    const { isProd, publicPath, root, buildFolder } = forceConfig;
    this.isProd = opts;
    this.root = root;
    this.buildFolder = buildFolder;
  }

  getCompiler() {
    const configs = this.getConfigs();
    return webpack(configs);
  }

  dev() {}

  watch() {
    const compiler = this.getCompiler();
    compiler.watch(this.compileCb);
  }

  compileCb(err, stats) {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    console.log(
      stats.toString({
        chunks: false,
        colors: true,
      })
    );
  }

  build() {
    const compiler = this.getCompiler();
    compiler.run(this.compileCb);
  }
  buildLib() {
    webpack(this.getLibConfigs(), this.compileCb);
  }

  getConfigs() {
    const Config = this.isProd ? ProdConfig : DevConfig;
    const configs = this.forceConfig.configs.map(rawConfig => {
      const fileList = this.getFileList(rawConfig);
      const [options, config] = this.pickReturnPickAndRest(
        rawConfig,
        PortWebpack.metaKeys
      );
      return new Config(config, fileList, {
        isProd: this.isProd,
        root: this.root,
        publicPath: this.publicPath,
        buildFolder: this.buildFolder,
        ...options,
      });
    });

    const webpackConfigs = configs.map(config => config.getConfig());

    return webpackConfigs;
  }

  getLibConfigs() {
    const { libConfig, publicPath } = this.forceConfig;

    const libConfig = new LibConfig(
      {},
      {},
      {
        name: 'commonLib',
        root: this.root,
        publicPath,
      }
    );

    return libConfig.getConfig();
  }
}

PortWebpack.metaKeys = [
  'src',
  'dest',
  'entryRules',
  'entryCb',
  'libEntry',
  'configCb',
  'disableLoaders',
];

module.exports = WebpackPort.default = WebpackPort;
