const fs = require('fs');

const staticManifest = {};

function ChunkStaticPlugin(opts) {
  opts = opts ? opts : {};
  this.fileName = opts.fileName || 'chunk-manifest.json';
  this.cache = opts.cache || staticManifest;
}

ChunkStaticPlugin.prototype.apply = function (compiler) {
  const fileName = this.fileName;
  const cache = this.cache;
  compiler.plugin('emit', function (compilation, callback) {
    compilation.chunks.forEach(chunk => {
      cache[chunk.name] = cache[chunk.name] ? [].concat(cache[chunk.name], chunk.files) : chunk.files;
    });

    const source = JSON.stringify(cache, null, 2);

    compilation.assets[fileName] = {
      source: function () {
        return source;
      },
      size: function () {
        return source.length;
      }
    };

    callback();
  });
}

module.exports = ChunkStaticPlugin['default'] = ChunkStaticPlugin;
