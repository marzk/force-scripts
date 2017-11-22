const middleware = require('force-scripts-middleware');
const webpack = require('webpack');
const path = require('path');
const ChunkStaticPlugin = require('./ChunkStaticPlugin');
const ROOT = process.cwd();
const debug = require('debug')('forceScripts');
const compose = require('composition');
const forceConfig = require('./load-config')();
const fs = require('./fs');

const manifest = require('./manifest');
const genCompiler = require('./compiler');

module.exports = forceScripts['default'] = forceScripts;
module.exports.getStaticFromEntry = manifest.getStaticFromEntry;
module.exports.getUrlFromFile = manifest.getUrlFromFile;

function forceScripts(opts = {}) {
  const middlewares = [initMethod];

  let compiler;

  // 生产环境无须compile，若外置devServer无须compile
  if (!forceConfig.isProd) {
    compiler = genCompiler();

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

  const middlewareForce = function*(next) {
    yield m.call(this, next);
  };

  middlewareForce.compiler = compiler;
  return middlewareForce;

  function* initMethod(next) {
    this.getStaticFromEntry = manifest.getStaticFromEntry;
    this.getUrlFromFile = manifest.getUrlFromFile;

    return yield next;
  }
}
