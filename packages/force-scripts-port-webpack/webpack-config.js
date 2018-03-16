const _ = require('lodash');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CaseSensitivePlugin = require('case-sensitive-paths-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ChunkStaticPlugin = require('../ChunkStaticPlugin');
const url = require('url');
const path = require('path');

const progressHandler = require('./tools/progress-handler');

class WebpackConfig {
  static count = 0;
  static metaKeys = [
    'name',
    'src',
    'dest',
    'entryRules',
    'entryCb',
    'libEntry',
    'configCb',
    'disableLoaders',
  ];
  constructor(
    rawConfig,
    fileList,
    {
      name,
      root,
      src,
      dest,
      buildFolder = 'build/commonlib',
      isProd = false,
      publicPath,
    }
  ) {
    this.rawConfig = rawConfig;
    this.fileList = fileList;
    this.root = root;
    this.src = src;
    this.dest = dest;
    this.absSrc = path.join(root, src);
    this.absDest = path.join(root, dest);
    this.buildFolder = this.buildFolder;
    this.buildPath = path.join(this.root, this.buildFolder);
    this.index = WebpackPort.count++;
    this.name = name || `${this.index}`;
    this.publicPath = publicPath;
    this.isProd = isProd;

    this.configName = `force-scripts-webpack-${this.name}`;
    this.libEntry = this.rawConfig.libEntry;
    this.isEnableLib = !!this.libEntry;
  }

  getConfig() {
    const customConfig = _.omit(this.rawConfig, WebpackConfig.metaKeys);

    const beforeConfig = merge(
      this.baseConfig(),
      this.isProd ? this.prodConfig() : this.devConfig(),
      this.libConfig()
    );

    const { configCb, disableLoaders } = this.rawConfig;

    if (disableLoaders) {
      beforeConfig.module.loaders = [];
      const extractPluginIndex = beforeConfig.plugins.findIndex(
        plugin => plugin.constructor.name === 'ExtractTextPlugin'
      );
      if (extractPluginIndex > -1) {
        beforeConfig.plugins.splice(extractPluginIndex, 1);
      }
    }

    const config = merge.smart(beforeConfig, customConfig);

    return typeof configCb === 'function' ? configCb(config) : config;
  }

  baseConfig() {
    return {
      context: this.root,
      name: this.configName,
      entry: this.getEntry(),
      output: {
        publicPath: this.publicPath,
        path: this.absDest,
      },
      module: {
        loaders: [
          {
            test: /\.(png|jpg|jpeg|gif|svg|eot|ttf|otf|woff|woff2)$/,
            loader: 'url-loader',
            query: {
              context: this.absSrc,
              name: `[path][name].${this.isprod ? '[hash:8].' : ''}[ext]`,
              limit: 10000,
            },
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
        new ManifestPlugin({
          cache: this.manifest,
          publicPath: this.publicPath,
        }),
        new ChunkStaticPlugin({
          cache: this.chunkStaticManifest,
          cb: function(chunk) {
            if (this.isEnableLib) {
              chunk.js.unshift(
                url.resolve(
                  publicPath,
                  path.join('build/', this.commonLibFileName)
                )
              );
            }
            return chunk;
          },
        }),
      ],
    };
  }
  devConfig() {
    return {
      output: {
        path: '/',
        filename: '[name].js',
      },
      module: {
        loaders: [
          {
            test: /\.s?css$/,
            loader:
              'style-loader!css-loader?-autoprefixer&importLoaders=1!postcss-loader',
          },
        ],
      },
      devtool: 'eval',
      plugins: [
        new webpack.ProgressPlugin(progressHandler),
        new CaseSensitivePlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
      ],
    };
  }
  prodConfig() {
    return {
      output: {
        filename: '[name].[chunkhash:8].js',
        chunkFilename: '[name].[chunkhash:8].js',
      },
      module: {
        loaders: [
          {
            test: /\.s?css$/,
            loader: ExtractTextPlugin.extract(
              'style-loader',
              'css-loader?-autoprefixer&importLoaders=1!postcss-loader'
            ),
          },
        ],
      },
      plugins: [
        new ExtractTextPlugin('[name].[contenthash:8].css', {
          allChunks: true,
        }),
      ],
    };
  }
  libConfig() {
    let commonLibFileName;
    let libConfig = {};
    if (this.isEnableLib) {
      let commonLibName = this.getCommonLibName();
      if (this.isProd) {
        const libManifest = require(path.join(this.buildPath, 'manifest.json'));
        // 获取生产环境下带hash的manifest文件名
        commonLibFileName = libManifest[
          `commonlib/${commonLibName}.js`
        ].replace('commonlib/', '');
      } else {
        commonLibFileName = `${commonLibName}.dev.js`;
      }
      libConfig = {
        plugins: [
          new webpack.DllReferencePlugin({
            context: this.root,
            manifest: require(path.join(
              this.buildPath,
              `${commonLibName}-${this.isProd ? 'prod' : 'dev'}-manifest.json`
            )),
          }),
          new CopyPlugin([
            {
              from: path.join(this.buildFolder, commonLibFileName),
              to: 'build',
            },
          ]),
        ],
      };
      this.commonLibName = commonLibName;
      this.commonLibFileName = commonLibFileName;
    }

    return libConfig;
  }

  getEntry() {
    const { entryCb } = this.rawConfig;
    return this.fileList.reduce((entryMap, file) => {
      const name = this.stripExt(path.relative(this.absSrc, file));
      const entryFile = entryCb ? entryCb(name, file) : file;
      entryMap[name] = Array.isArray(entryFile)
        ? entryFile
        : [].concat(entryFile);
      entryMap[name] = this.handleEntry(name, entryMap[name]);

      return entryMap;
    }, {});
  }
  getCommonLibName() {
    const configName = this.name;
    return `commonLib${configName.charAt(0).toUpperCase()}${configName.slice(
      1
    )}`;
  }
  stripExt(filename) {
    const pathObj = path.parse(filename);
    return path.join(pathObj.dir, pathObj.name);
  }
  handleEntry(name, entry) {
    if (!this.isProd) {
      entry.unshift(
        `webpack-hot-middleware/client?name=${this.configName}&timeout=6000`
      );
    }
    if (this.isEnableLib) {
      entry.unshift(path.resolve(this.src, this.libEntry));
    }
  }
}

module.exports = WebpackConfig.default = WebpackConfig;
