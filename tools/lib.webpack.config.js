const merge = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');

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

module.exports = forceConfig => {
  const {
    configs,
    publicPath,
  } = forceConfig;

  const entry = configs.reduce((acc, config, index) => {
    if (config.libEntry) {
      acc[`commonLib${index}`] = [path.resolve(config.src, config.libEntry)];
    }

    return acc;
  }, {});

  const relyConfig = {
    entry,
    output: {
      publicPath,
    },
  };

  return [
    merge(baseConfig, devConfig, relyConfig),
    merge(baseConfig, prodConfig, relyConfig),
  ];
};
