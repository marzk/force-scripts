const BaseConfig = require('./base-config');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

class ProdConfig extends BaseConfig {
  constructor(rawConfig, fileList, opts = {}) {
    super(rawConfig, fileList, opts);
    this.disableLoaders = !!opts.disableLoaders;
  }

  specificConfig() {
    // 需要被子类实现
    const baseSpecificConfig = super.specificConfig();
    return merge(baseSpecificConfig, this.prodConfig());
  }
  prodConfig() {
    const config = {
      output: {
        filename: '[name].[chunkhash:8].js',
        chunkFilename: '[name].[chunkhash:8].js',
      },
    };
    if (!this.disableLoaders) {
      config.module = {
        loaders: [
          {
            test: /\.s?css$/,
            loader: ExtractTextPlugin.extract(
              'style-loader',
              'css-loader?-autoprefixer&importLoaders=1!postcss-loader'
            ),
          },
        ],
      };
      config.plugins = [
        new ExtractTextPlugin('[name].[contenthash:8].css', {
          allChunks: true,
        }),
      ];
    }

    return config;
  }
}

module.exports = ProdConfig.default = ProdConfig;
