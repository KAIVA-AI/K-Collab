const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const publicUrl = process.env.PUBLIC_URL || 'http://localhost:3000';

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build'),
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
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
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
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.PUBLIC_URL': JSON.stringify(publicUrl),
    }),
  ],
};
