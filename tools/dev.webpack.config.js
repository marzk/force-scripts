const webpack = require('webpack');
const CaseSensitivePlugin = require('case-sensitive-paths-webpack-plugin');
const progressHandler = require('./progress-handler');
const forceConfig = require('./load-config');

const plugins = [new CaseSensitivePlugin()];

if (forceConfig.hot) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

if (forceConfig.progress) {
  plugins.unshift(new webpack.ProgressPlugin(progressHandler));
}

module.exports = {
  output: {
    path: '/',
    filename: '[name].js',
  },
  module: {
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
  },
  devtool: 'eval',
  plugins: plugins,
};
