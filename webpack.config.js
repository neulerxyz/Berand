// webpack.config.js
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: './src/popup/index.js',
    signup: './src/signup/index.js',
    background: './src/background.js',
    content: './src/content.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  mode: 'production',
  devtool: false,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
    plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '.' }, // publicフォルダの内容をdistフォルダのルートにコピー
      ],
    }),
    // 他のプラグインがあればここに追加
  ],
  resolve: {
    alias: {
      Shared: path.resolve(__dirname, 'src/shared/'),
    },
    extensions: ['.js', '.jsx'],
  },
};

