const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
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
  plugins: [
    new UglifyJSPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": "production",
      "process.env.VERSION": JSON.stringify(require("./package.json").version)
    })
  ]
};
