const middleware = require('force-scripts-middleware');
const webpack = require('webpack');
const path = require('path');
const ChunkStaticPlugin = require('./ChunkStaticPlugin');
const ROOT = process.cwd();
const debug = require('debug')('forceScripts');
const compose = require('composition');
const forceConfig = require('./load-config')();
const fs = require('./fs');

const webpackConfig = require('./tools/base.webpack.config');

const manifest = require('./manifest');

module.exports = forceScripts['default'] = forceScripts;

module.exports.getStaticFromEntry = manifest.getStaticFromEntry;
module.exports.getUrlFromFile = manifest.getUrlFromFile;

function forceScripts(opts = {}) {
  const middlewares = [initMethod];

  let compiler;

  if (!forceConfig.isProd) {
    compiler = webpack(webpackConfig);
    compiler.outputFileSystem = fs;

    opts.publicPath = opts.publicPath
      ? opts.publicPath
      : forceConfig.publicPath;

    const staticMiddleware = middleware(
      compiler,
      Object.assign(
        {
          stats: {
            colors: true,
            chunks: false,
          },
        },
        opts
      )
    );
    middlewares.unshift(staticMiddleware);
  }

  const m = compose(middlewares);
  return function*(next) {
    yield m.call(this, next);
  };

  function* initMethod(next) {
    this.getStaticFromEntry = manifest.getStaticFromEntry;
    this.getUrlFromFile = manifest.getUrlFromFile;

    return yield next;
  }
}
