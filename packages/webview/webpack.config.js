const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config();
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const publicUrl = process.env.PUBLIC_URL || 'http://localhost:3000';
const packageJson = require('../../package.json');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, '../../dist/webview'),
    publicPath: publicUrl + '/',
    filename: 'static/js/bundle.[contenthash].js',
    clean: true,
  },
  devServer: {
    compress: true,
    port: 3000,
    historyApiFallback: true,
    allowedHosts: 'all',
    hot: false,
    client: false,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      buffer: require.resolve('buffer'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
              ],
            },
          },
          'ts-loader',
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(svg|png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(ttf)$/i,
        type: 'javascript/auto',
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'static/fonts/',
              publicPath: publicUrl + '/static/fonts/',
              esModule: false,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new NodePolyfillPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.REALM_STRING': JSON.stringify(process.env.REALM_STRING),
      'process.env.USER_EMAIL': JSON.stringify(process.env.USER_EMAIL),
      'process.env.USER_API_KEY': JSON.stringify(process.env.USER_API_KEY),

      'process.env.PUBLIC_URL': JSON.stringify(publicUrl),
      'process.env.WEBVIEW_VERSION': JSON.stringify(packageJson.version),
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.BannerPlugin(`${packageJson.name} v${packageJson.version}`),
  ],
};
