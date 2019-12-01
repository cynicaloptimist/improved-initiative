const WebpackBuildNotifierPlugin = require("webpack-build-notifier");
const path = require("path");
const webpack = require("webpack");
const baseConfig = require("./webpack.config.base");
const merge = require("webpack-merge");

module.exports = merge(baseConfig, {
  devtool: "inline-source-map",
  watch: true,
  mode: "development",
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
      "process.env.VERSION": JSON.stringify(require("./package.json").version)
    }),
    new WebpackBuildNotifierPlugin({
      title: "Client",
      logo: path.resolve("./public/img/logo-improved-initiative.svg"),
      showDuration: true,
      notifierOptions: {
        timeout: 1
      }
    })
  ]
});
