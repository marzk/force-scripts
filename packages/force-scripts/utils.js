const path = require('path');

module.exports.stripExt = stripExt;

function stripExt(filename) {
  const pathObj = path.parse(filename);
  return path.join(pathObj.dir, pathObj.name);
}
