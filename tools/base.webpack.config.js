const webpack = require('webpack');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const merge = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const lodash = require('lodash')
const ManifestPlugin = require('webpack-manifest-plugin');
const url = require('url');
const debug = require('debug')('forceScripts');

const ROOT = process.cwd();
const devConfig = require('./dev.webpack.config');
const prodConfig = require('./prod.webpack.config');
const ChunkStaticPlugin = require('../ChunkStaticPlugin');
const getNameFromLibEntry = require('../utils/getConfigNameFromLibEntry');

const manifest = {};
const chunkStaticManifest = {};

const forceConfig = require('../load-config')();
const isProd = forceConfig.isProd;

const baseConfig = {
  context: ROOT,
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader?cacheDirectory',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  plugins: [
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        IS_BROWSER: true,
      },
    }),
  ],
};

let configs = forceConfig.configs;
const publicPath = forceConfig.publicPath;

configs = [].concat(configs);

module.exports = configs.map((config, index) => {
  const name = config.name,
    src = config.src,
    dest = config.dest,
    entryRules = config.entryRules,
    entryCb = config.entryCb,
    configCb = config.configCb,
    disableLoaders = config.disableLoaders,
    libEntry = config.libEntry;

  const restConfig = lodash.omit(config, [
    'name', 'src', 'dest', 'entryRules', 'entryCb', 'libEntry', 'configCb', 'disableLoaders'
  ]);

  const entryList = handleRule(entryRules, config)

  let libConfig = {};
  let commonLibName;
  if (libEntry) {
    let relativeLibEntry = path.resolve(src, libEntry);
    let commonLib = getNameFromLibEntry(relativeLibEntry);
    if (isProd) {
      const libManifest = require(path.join(ROOT, 'build/commonlib', 'manifest.json'));
      lodash.defaults(manifest, libManifest);
      commonLibName = libManifest[`commonlib/${commonLib}.js`].replace('commonlib/', '');
    } else {
      commonLibName = `${commonLib}.dev.js`;
    }
    libConfig = {
      plugins: [
        new webpack.DllReferencePlugin({
          context: ROOT,
          manifest: require(path.join(ROOT, 'build/commonlib', `${commonLib}-${isProd ? 'prod' : 'dev'}-manifest.json`)),
        }),
        new CopyPlugin([
          {
            from: path.join('build/commonlib', commonLibName),
            to: 'build',
          },
        ]),
      ],
    };
  }

  const forceName = name || `force-scripts${index}`;

  const beforeCustomConfig = merge({
    name: forceName,
    entry: entryList.reduce((acc, entry) => {
      const entryObj = path.parse(path.relative(path.relative(ROOT, src), entry));
      const name = path.join(entryObj.dir, entryObj.name);
      entry = entryCb ? entryCb(name, entry) : entry;
      acc[name] = [].concat(entry);
      if (!isProd) {
        acc[name].unshift(`webpack-hot-middleware/client?reload&name=${forceName}&timeoout=6000`);
      }
      if (libEntry) {
        acc[name].unshift(path.resolve(src, libEntry));
      }

      return acc;
    }, {}),
    output: {
      publicPath: publicPath,
      path: path.relative(__dirname, dest),
    },
  }, baseConfig, isProd ? prodConfig : devConfig, libConfig, {
    plugins: [
      new ManifestPlugin({
        cache: manifest,
      }),
      new ChunkStaticPlugin({
        cache: chunkStaticManifest,
        cb: function (chunk) {
          if (commonLibName) {
            chunk.js.unshift(url.resolve(publicPath, path.join('build/', commonLibName)));
          }
          return chunk;
        }
      })
    ],
  });

  if (disableLoaders) {
    beforeCustomConfig.module.loaders = [];
    const extractPluginIndex = beforeCustomConfig.plugins.findIndex(plugin => plugin.constructor.name === 'ExtractTextPlugin');
    if (extractPluginIndex > -1) {
      beforeCustomConfig.plugins.splice(extractPluginIndex, 1);
    }
  }

  debug('beforeCustomConfig', beforeCustomConfig);


  const mergedConfig = merge.smart(beforeCustomConfig, restConfig);

  return typeof configCb === 'function' ? configCb(mergedConfig) : mergedConfig;
});



function handleRule(rules, config) {
  rules = [].concat(rules);

  return rules.reduce((acc, rule) => {
    switch (Object.prototype.toString.call(rule)) {
      case '[object String]':
        return acc.length === 0 ? glob.sync(path.resolve(ROOT, config.src, rule)) : acc.filter(p => p.indexOf(rule) > -1);
      case '[object Regex]':
        return acc.filter(p => rule.test(p));
      case '[object Function]':
        return rule(acc);
      case '[object Array]':
        return acc.concat(handleRule(rule, config));
      default:
        console.error(rule, '错误的规则');
        process.exit(1);
    }
  }, []);
}
