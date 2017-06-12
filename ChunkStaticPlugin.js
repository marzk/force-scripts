const fs = require('fs');
const url = require('url');

const staticManifest = {};

function identity(i) { return i; }

function ChunkStaticPlugin(opts) {
  opts = opts ? opts : {};
  this.fileName = opts.fileName || 'chunk-manifest.json';
  this.cache = opts.cache || staticManifest;
  this.cb = opts.cb || identity;
}

ChunkStaticPlugin.prototype.apply = function (compiler) {
  const fileName = this.fileName;
  const cache = this.cache;
  const publicPath = compiler.options.output.publicPath;
  const cb = this.cb;
  compiler.plugin('emit', function (compilation, callback) {
    compilation.chunks.forEach(chunk => {
      const chunkFiles = chunk.files.map(file => url.resolve(publicPath || '', file));
      const js = chunkFiles[0];
      const css = chunkFiles.filter(file => /\.css($|\?)/.test(file));

      cache[chunk.name] = cb({
        js: [].concat(js),
        css: css
      });
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
