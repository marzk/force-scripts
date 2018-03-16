const _ = require('lodash');
const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

const Port = require('force-scripts/port');

class PortWebpack extends Port {
  constructor(forceConfig, opts = {}) {
    super(forceConfig, opts);
    const { isProd, root, buildFolder } = opts;
    this.isProd = opts;
    this.root = root;
    this.buildFolder = buildFolder;
  }

  distribute() {}

  dllConfig(nameLibEntryMap) {
    const { publicPath } = this.config;
    const entry = Object.keys(nameLibEntryMap).reduce((entry, name) => {
      entry[name] = nameLibEntryMap[name];

      return entry;
    }, {});
    const baseConfig = {
      context: this.root,
      output: {
        path: path.resolve(this.root, this.buildFolder),
        library: '[name]',
      },
      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: require.resolve('./passthrough-loader'),
            exclude: /node_modules/,
          },
        ],
      },
      plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
      ],
    };

    return [];
  }
}

module.exports = WebpackPort.default = WebpackPort;
