const path = require('path');

const forceConfig = require('./load-config')();
const fs = require('./fs');
const webpackConfig = require('./tools/base.webpack.config');
const manifest = require('./manifest-cache');

const lastWebpackConfig = Array.isArray(webpackConfig)
  ? webpackConfig[webpackConfig.length - 1]
  : webpackConfig;
const outputPath = lastWebpackConfig.output.path;

const chunkManifestPath = path.resolve(outputPath, 'chunk-manifest.json');
const fileManifestPath = path.resolve(outputPath, 'manifest.json');

module.exports.chunk = manifest.chunk;
module.exports.file = manifest.file;

if (forceConfig.isProd) {
  updateManifest();
}

function updateManifest() {
  if (forceConfig.isProd) {
    Object.assign(manifest.chunk, getManifest(chunkManifestPath));
    Object.assign(manifest.file, getManifest(fileManifestPath));
  }
}

function getManifest(manifestPath) {
  try {
    return require(manifestPath);
  } catch (e) {
    return {};
  }
}

module.exports.getStaticFromEntry = function(entry) {
  return (
    manifest.chunk[entry] || {
      js: [],
      css: [],
    }
  );
};

module.exports.getUrlFromFile = function(file) {
  return manifest.file[file] || '';
};
