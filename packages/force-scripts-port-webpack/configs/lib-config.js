const WebpackConfig = require('./webpack-config');

class LibConfig extends WebpackConfig {
  constructor(rawConfig, fileList, opts) {
    super(rawConfig, fileList, opts);
    const { buildFolder = 'build/commonlib' } = rawConfig;
    this.buildFolder = buildFolder;
    this.buildPath = path.join(this.root, this.buildFolder);
  }

  getConfig() {
    const baseConfig = this.baseConfig();
    const customConfig = this.customConfig();
    const devConfig = merge(baseConfig, this.devConfig(), customConfig);
    const prodConfig = merge(baseConfig, this.prodConfig(), customConfig);

    return [devConfig, prodConfig];
  }

  baseConfig() {
    return merge(super.baseConfig(), {
      output: {
        library: '[name]',
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            use: require.resolve('../loaders/passthrough-loader'),
            exclude: /node_modules/,
          },
        ],
      },
    });
  }

  devConfig() {
    return {
      devtool: 'eval',
      output: {
        filename: '[name].dev.js',
      },
      plugins: [
        new webpack.DllPlugin({
          path: path.join(this.buildFolder, '[name]-dev-manifest.json'),
          name: '[name]',
          context: this.root,
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': '"development"',
        }),
      ],
    };
  }
  prodConfig() {
    return {
      output: {
        filename: '[name].[chunkhash:8].min.js',
      },
      plugins: [
        new webpack.DllPlugin({
          path: path.join(this.buildFolder, '[name]-prod-manifest.json'),
          name: '[name]',
          context: this.root,
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': '"production"',
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
        }),
      ],
    };
  }
}

module.exports = LibConfig.default.LibConfig;
