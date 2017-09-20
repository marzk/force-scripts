import path = require('path');
import webpack = require('webpack');

import { transformFileListToEntry } from '../utils';

const ROOT = process.cwd();

export default class Webpack1 implements Port {
  config: any;
  watcher: any;
  compiler: any;

  constructor(config: Config[] | Config) {
    this.config = Array.isArray(config)
      ? config.map(this.initConfig)
      : this.initConfig(config);
    this.compiler = webpack(this.config);
  }

  initConfig(config: Config) {
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
    if (this.watcher) {
      this.watcher.close();
    }
  }

  compileError(err: any) {
    console.error(err);
  }

  compileDone() {
    console.log('done');
  }
}
