const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './client/Index.ts',
  devtool: 'inline-source-map',
  watch: true,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'ImprovedInitiative.js',
    path: path.resolve(__dirname, 'public', 'js')
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify("development"),
      'process.env.VERSION': JSON.stringify(require("./package.json").version)
    })
  ]
};
