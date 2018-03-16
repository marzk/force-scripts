import { file } from './manifest-cache';

const path = require('path');
const { EntryRules } = require('./entry-rules');

class ForceConfig {
  constructor(rawForceConfig, { port, workdir = process.cwd() }) {
    this.workdir = workdir;
  }

  process() {}

  distribute(Port, config) {
    const entryRules = new EntryRules(config.entryRules, {
      workdir: path.resolve(this.workdir, config.src),
    });

    return new Port(config, entryRules.getFileList(), {
      workdir: this.workdir,
    });
  }

  get() {}

  build() {}

  watch() {}

  dev() {}
}

class GulpPort extends Port {}
