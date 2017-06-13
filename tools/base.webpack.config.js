const webpack = require('webpack');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const merge = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const lodash = require('lodash')
const ManifestPlugin = require('webpack-manifest-plugin');
const url = require('url');

const ROOT = process.cwd();
const devConfig = require('./dev.webpack.config');
const prodConfig = require('./prod.webpack.config');
const isProd = process.env.NODE_ENV === 'production';
const ChunkStaticPlugin = require('../ChunkStaticPlugin');

const manifest = {};
const chunkStaticManifest = {};

const forceConfig = require('../load-config')();

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
  const src = config.src,
    dest = config.dest,
    entryRules = config.entryRules,
    entryCb = config.entryCb,
    libEntry = config.libEntry;

  const restConfig = lodash.omit(config, [
    'src', 'dest', 'entryRules', 'entryCb', 'libEntry'
  ]);

  const entryList = handleRule(entryRules, config)

  let libConfig = {};
  let commonLibName;
  if (libEntry) {
    let commonLib = `commonLib${index}`;
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

  const name = `force-scripts${index}`;

  return merge({
    name: name,
    entry: entryList.reduce((acc, entry) => {
      const entryObj = path.parse(path.relative(path.relative(ROOT, src), entry));
      const name = path.join(entryObj.dir, entryObj.name);
      entry = entryCb ? entryCb(name, entry) : entry;
      acc[name] = [].concat(entry);
      if (!isProd) {
        acc[name].unshift(`webpack-hot-middleware/client?reload&name=${name}&timeout=4000`);
      }
      if (libEntry) {
        acc[name].unshift(path.resolve(src, libEntry));
      }

      return acc;
    }, {}),
    output: {
      publicPath: publicPath,
      path: dest,
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
  }, restConfig);
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
