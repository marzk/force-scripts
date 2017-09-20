const path = require('path');

function transformFileListToEntry(basePath, fileList, opts) {
  return fileList.reduce((entry, filePath) => {
    const name = stripExt(path.relative(basePath, filePath));
    entry[name] = [].concat(filePath);

    if (opts && opts.callbackEntry) {
      entry[name] = opts.callbackEntry(name, entry[name]);
    }

    return entry;
  }, {});
}

function stripExt(filename) {
  const pathObj = path.parse(filename);

  return path.join(pathObj.dir, pathObj.name);
}

module.exports.transformFileListToEntry = transformFileListToEntry;

module.exports.stripExt = stripExt;
