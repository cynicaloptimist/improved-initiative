const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const baseConfig = require("./webpack.config.base");
const merge = require("webpack-merge");

module.exports = merge(baseConfig,
  {
    plugins: [
      new UglifyJSPlugin(),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env.VERSION": JSON.stringify(require("./package.json").version)
      })
    ],
  });
