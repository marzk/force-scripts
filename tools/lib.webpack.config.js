const merge = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');
const progressHandler = require('./progress-handler');
const forceConfig = require('../load-config')();
const getConfigNameFromLibEntry = require('../utils/getConfigNameFromLibEntry');
const entryMap = getConfigNameFromLibEntry.map;

const ROOT = process.cwd();

const baseConfig = {
  context: ROOT,
  output: {
    path: 'build/commonlib',
    library: '[name]',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(progressHandler),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
  ],
};

const devConfig = {
  devtool: 'eval',
  output: {
    filename: '[name].dev.js',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join('build/commonlib', '[name]-dev-manifest.json'),
      name: '[name]',
      context: ROOT,
    }),
  ],
};

const prodConfig = {
  output: {
    filename: '[name].[chunkhash:8].min.js',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join('build/commonlib', '[name]-prod-manifest.json'),
      name: '[name]',
      context: ROOT,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false,
      },
      output: {
        comments: false,
      },
    }),
    new ManifestPlugin({
      basePath: 'commonlib/',
    })
  ],
};

const configs = forceConfig.configs,
  publicPath = forceConfig.publicPath;

const libConfig = forceConfig.libConfig === undefined ? forceConfig.libConfig : {};

const entry = Object.keys(entryMap).reduce((acc, libEntry) => {
  const name = getConfigNameFromLibEntry(libEntry);

  if (!acc[name]) {
    acc[name] = [libEntry];
  }

  return acc;

}, {});

// const entry = configs.reduce((acc, config, index) => {
//   if (config.libEntry) {
//     acc[`commonLib${index}`] = [path.resolve(config.src, config.libEntry)];
//   }
// 
//   return acc;
// }, {});

const relyConfig = {
  entry: entry,
  output: {
    publicPath: publicPath,
  },
};

module.exports = [
  merge(baseConfig, devConfig, relyConfig, libConfig),
  merge(baseConfig, prodConfig, relyConfig, libConfig),
];
