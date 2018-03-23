const through = require('through2');
const { createHash } = require('crypto');
const path = require('path');
const Vinyl = require('vinyl');

module.exports = function({
  hashLength = 8,
  manifest: manifestPath = 'manifest.json',
} = {}) {
  const manifest = {};

  return through.obj(
    function(file, encoding, callback) {
      if (file.isNull()) {
        return callback(null, file);
      }

      const md5 = createHash('md5');

      if (file.isStream()) {
        file.contents.pipe(md5);
      } else if (file.isBuffer()) {
        md5.update(file.contents);
      }

      const hash = md5.digest('hex').substr(0, hashLength);
      const oldRelative = file.relative;

      const pathObj = path.parse(file.path);
      file.path = path.join(
        pathObj.dir,
        `${pathObj.name}.${hash}${pathObj.ext}`
      );

      manifest[oldRelative] = path.relative(file.base, file.path);

      callback(null, file);
    },
    function(callback) {
      const file = new Vinyl({
        cwd: './',
        path: manifestPath,
        contents: Buffer.from(JSON.stringify(manifest)),
      });
      this.push(file);
      callback();
    }
  );
};
