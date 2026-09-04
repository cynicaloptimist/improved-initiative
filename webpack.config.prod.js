const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const baseConfig = require("./webpack.config.base");
const merge = require("webpack-merge");

module.exports = merge(baseConfig, {
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename, require.resolve("./webpack.config.base")]
    }
  },
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.VERSION": JSON.stringify(require("./package.json").version)
    })
  ]
});
