const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const baseConfig = require("./base.config");

module.exports = Object.assign(baseConfig,
  {
    plugins: [
      new UglifyJSPlugin(),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env.VERSION": JSON.stringify(require("./package.json").version)
      })
    ],
  });
