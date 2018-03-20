const WebpackConfig = require('./webpack-config');
const merge = require('webpack-merge');
const ManifestPlugin = require('webpack-manifest-plugin');
const ChunkStaticPlugin = require('../plugins/ChunkStaticPlugin');
const webpack = require('webpack');
const path = require('path');

class BaseConfig extends WebpackConfig {
  constructor(rawConfig, fileList, opts) {
    super(rawConfig, fileList, opts);

    const {
      buildFolder = 'build/commonlib',
      disableLoaders,
      libEntry,
    } = rawConfig;
    this.buildFolder = buildFolder;
    this.buildPath = path.join(this.root, this.buildFolder);
    this.libEntry = libEntry;
    this.isEnableLib = !!this.libEntry;
  }

  specificConfig() {
    const libConfig = this.libConfig();
    return merge(
      {
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

        plugins: [
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV),
              IS_BROWSER: 'true',
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
      },
      libConfig
    );
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

  postProcessEntry(name, entry) {
    if (this.isEnableLib) {
      entry.unshift(path.resolve(this.src, this.libEntry));
    }

    return entry;
  }
}

module.exports = BaseConfig.default = BaseConfig;
