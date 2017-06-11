const middleware = require('force-scripts-middleware');
const webpack = require('webpack');
const path = require('path');
const ChunkStaticPlugin = require('./ChunkStaticPlugin');
const ROOT = process.cwd();
const debug = require('debug')('forceScripts');
const compose = require('koa-compose');
const forceConfig = require('./load-config')();

const webpackConfig = require('./tools/base.webpack.config');
let manifestPath;

module.exports = forceScripts['default'] = forceScripts;

function forceScripts(opts = {}) {
  const middlewares = [initMethod];

  let compiler;

  if (!opts.disable) {
    compiler = webpack(webpackConfig);

    console.log(forceConfig);
    opts.publicPath = opts.publicPath ? opts.publicPath : forceConfig.publicPath;

    const staticMiddleware = middleware(compiler, Object.assign({
      stats: {
        colors: true,
        chunks: false,
      },
    }, opts));
    middlewares.unshift(staticMiddleware);
  }

  const manifest = getManifest(
    manifestPath,
    (typeof staticMiddleware !== 'undefined' && staticMiddleware.fs) || require('fs')
  );
  debug('manifest: ', manifest);

  const m = compose(middlewares);
  console.log(m.constructor.name);
  return m;

  function* initMethod(next) {
    this.getStaticFromEntry = getStaticFromEntry;

    return yield next;
  }

  function getStaticFromEntry(entry) {
    return manifest[entry] || [];
  }
}

function getManifestPath(config) {
  const outputPath = config.output.path;
  const manifestFileName = config.plugins.find(
    plugin => plugin instanceof ChunkStaticPlugin
  ).fileName;

  return path.resolve(outputPath, manifestFileName);
}

function getManifest(path, fs) {
  manifestPath = getManifestPath(
    Array.isArray(webpackConfig)
      ? webpackConfig[webpackConfig.length - 1]
      : webpackConfig
  );

  if (fs.existsSync(path)) {
    try {
      return JSON.parse(fs.readFileSync(path));
    } catch (e) {
      console.trace(e);
      return {};
    }
  }
  return {};
}
