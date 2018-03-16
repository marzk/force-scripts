const { EntryRules } = require('./entry-rules');
const path = require('path');

class Port {
  constructor(config, { workdir }) {
    this.config = config;
    this.workdir = workdir;
  }

  getFileList(config) {
    const entryRules = new EntryRules(config.entryRules, {
      workdir: path.resolve(this.workdir, config.src),
    });

    return entryRules.getFileList();
  }

  stripExt(filename) {
    const pathObj = path.parse(filename);
    return path.join(pathObj.dir, pathObj.name);
  }
}

module.exports = Port.default = Port;
