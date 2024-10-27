//@ts-check

'use strict';

const path = require('path');
const webpack = require('webpack');
require('dotenv').config();
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node',
  mode: 'none',

  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, '../../dist/vscode'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: 'log',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.PROJECT_SETTING_HOST': JSON.stringify(
        process.env.PROJECT_SETTING_HOST,
      ),

      'process.env.REALM_STRING': JSON.stringify(process.env.REALM_STRING),
      'process.env.USER_EMAIL': JSON.stringify(process.env.USER_EMAIL),
      'process.env.USER_API_KEY': JSON.stringify(process.env.USER_API_KEY),

      'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL),
    }),
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
  ],
};
module.exports = [extensionConfig];
