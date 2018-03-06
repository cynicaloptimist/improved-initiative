const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './client/Index.ts',
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
};
