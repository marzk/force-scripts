const fs = require('fs');
const url = require('url');

const staticManifest = {};

function identity(i) {
  return i;
}

function ChunkStaticPlugin(opts) {
  opts = opts ? opts : {};
  this.fileName = opts.fileName || 'chunk-manifest.json';
  this.cache = opts.cache || staticManifest;
  this.cb = opts.cb || identity;
}

ChunkStaticPlugin.prototype.apply = function(compiler) {
  const fileName = this.fileName;
  const cache = this.cache;
  const publicPath = compiler.options.output.publicPath;
  const cb = this.cb;
  compiler.plugin('emit', function(compilation, callback) {
    compilation.chunks.forEach(chunk => {
      const chunkFiles = chunk.files.map(file =>
        url.resolve(publicPath || '', file)
      );
      const files = getFiles(
        chunk,
        files =>
          [].concat(files).map(file => url.resolve(publicPath || '', file)),
        files => files.filter((file, index) => /\.(?:j|cs)s($|\?)/.test(file))
      );
      const js = files.filter(file => /\.js($|\?)/.test(file));
      const css = files.filter(file => /\.css($|\?)/.test(file));

      cache[chunk.name] = cb({
        js: [].concat(js),
        css: css,
      });
    });

    const source = JSON.stringify(cache, null, 2);

    compilation.assets[fileName] = {
      source: function() {
        return source;
      },
      size: function() {
        return source.length;
      },
    };

    callback();
  });
};

module.exports = ChunkStaticPlugin['default'] = ChunkStaticPlugin;

function getFiles(chunk, visit, filesFilter) {
  if (chunk.files.length === 0) return [];
  filesFilter = filesFilter || (files => files[0]);

  const file = visit(filesFilter(chunk.files));
  let files = [];
  if (chunk.parents && chunk.parents.length) {
    chunk.parents.forEach(chunk => {
      files = files.concat(getFiles(chunk, visit, filesFilter));
    });
  }
  files = files.concat(file);

  return files;
}
