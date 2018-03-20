const BaseConfig = require('./base-config');
const merge = require('webpack-merge');
const progressHandler = require('../plugins/progress-handler');

class DevConfig extends BaseConfig {
  constructor(rawConfig, fileList, opts = {}) {
    super(rawConfig, fileList, opts);
    const { hot, progress } = opts;
    this.disableLoaders = !!opts.disableLoaders;
  }

  specificConfig() {
    // 需要被子类实现
    const baseSpecificConfig = super.specificConfig();
    return merge(baseSpecificConfig, this.DevConfig());
  }
  DevConfig() {
    const config = {
      output: {
        path: '/',
        filename: '[name].js',
      },
      plugins: [new CaseSensitivePlugin()],
    };
    if (!this.disableLoaders) {
      config.module = {
        rules: [
          {
            test: /\.s?css$/,
            use: [
              'style-loader',
              'css-loader?-autoprefixer&importLoaders=1',
              'postcss-loader',
            ],
          },
        ],
      };
    }
    if (this.hot) {
      config.plugins.push(new webpack.HotModuleReplacementPlugin());
    }
    if (this.progress) {
      config.plugins.unshift(new webpack.ProgressPlugin(progressHandler));
    }

    return config;
  }
}

module.exports = DevConfig.default = DevConfig;
