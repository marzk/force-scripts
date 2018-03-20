const { EntryRules } = require('./entry-rules');
const path = require('path');

class Port {
  constructor(forceConfig) {
    this.forceConfig = forceConfig;
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

  pickReturnPickAndRest(obj, paths) {
    const restObj = { ...obj };
    const pickObj = paths.reduce((pickObj, pickKey) => {
      if (restObj.hasOwnProperty(pickKey)) {
        pickObj[pickKey] = restObj[pickKey];
        Reflect.deleteProperty(restObj, pickKey);
      }

      return pickObj;
    }, {});

    return [pickObj, restObj];
  }
}

module.exports = Port.default = Port;
