const path = require('path');
const webpack = require('webpack');

const { transformFileListToEntry } = require('./utils');

const ROOT = process.cwd();

export default class PortWebpack1 {
  constructor(config) {
    this.config = Array.isArray(config)
      ? config.map(this.initConfig)
      : this.initConfig(config);

    this.compiler = webpack(this.config);
  }

  initConfig(config) {
    const { name, src, dest, publicPath, portConfig, fileList } = config;

    const entry = transformFileListToEntry(path.resolve(ROOT, src), fileList);

    return {
      name,
      entry,
      output: {
        publicPath,
        path: path.resolve(ROOT, dest),
      },
      ...portConfig,
    };
  }
  watch() {
    this.watcher = this.compiler.watch({}, this.compileDone);
  }
  build() {
    this.compiler.run(this.compileDone);
  }
  destroy() {
    if (this.watcher) this.watcher.close();
  }

  comileDone(err, stats) {
    if (err) {
      console.error(err);
      return;
    }

    console.log('ok');
  }
}
