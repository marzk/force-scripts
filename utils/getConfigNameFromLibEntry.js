const path = require('path');
const forceConfig = require('../load-config')();

const map = {};
let generatedFlag = false;

module.exports = getConfigNameFromLibEntry[
  'default'
] = getConfigNameFromLibEntry;

Object.defineProperty(getConfigNameFromLibEntry, 'map', {
  get: getMap,
});

module.exports.getMap = map;

function getMap() {
  if (generatedFlag) return map;

  forceConfig.configs.reduce((acc, config, index) => {
    const name = config.name || index + '';
    const libEntry = config.libEntry;

    if (libEntry) {
      if (typeof libEntry !== 'string')
        throw new Error('libEntry only receive string, but ' + libEntry);

      const key = path.resolve(config.src, config.libEntry);
      acc[key] = acc[key] ? acc[key] : name;
    }

    return acc;
  }, map);
  generatedFlag = true;

  return map;
}

function getConfigNameFromLibEntry(libEntry) {
  const map = getMap();
  const configName = map[libEntry];

  return `commonLib${configName.charAt(0).toUpperCase()}${configName.slice(1)}`;
}
