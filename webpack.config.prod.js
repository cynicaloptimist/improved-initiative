const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const baseConfig = require("./webpack.config.base");
const merge = require("webpack-merge");

module.exports = merge(baseConfig,
  {
    mode: "production",
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env.VERSION": JSON.stringify(require("./package.json").version)
      })
    ],
  });
