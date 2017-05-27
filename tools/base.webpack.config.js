var webpack = require('webpack');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var merge = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');

var ROOT = process.cwd();
var devConfig = require('./dev.webpack.config');
var prodConfig = require('./prod.webpack.config');
const isProd = process.env.NODE_ENV === 'production';

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

module.exports = forceConfig => {
  let {
    configs,
    publicPath,
  } = forceConfig;
  configs = [].concat(configs);

  return configs.map((config, index) => {
    const entryList = handleRule(config.entryRules, config)

    let libConfig = {};
    if (config.libEntry) {
      let commonLibName;
      let commonLib = `commonLib${index}`;
      if (isProd) {
        commonLibName = require(path.join(ROOT, 'build/commonlib', 'manifest.json'))[`commonlib/${commonLib}.js`].replace('commonlib/', '');
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


    return merge({
      entry: entryList.reduce((acc, entry) => {
        acc[path.relative(path.relative(ROOT, config.src), entry).replace(/.jsx?$/, '')] = [entry];

        return acc;
      }, {}),
      output: {
        publicPath,
        path: config.dest,
      },
    }, baseConfig, isProd ? prodConfig : devConfig, libConfig);
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
          return acc.filter(rule);
        case '[object Array]':
          return acc.concat(handleRule(rule, config));
        default:
          console.error(rule, '错误的规则');
          process.exit(1);
      }
    }, []);
  }
};
