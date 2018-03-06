const path = require('path');
const webpack = require('webpack');
const baseConfig = require("./base.config");

module.exports = Object.assign(baseConfig,
  {
    devtool: 'inline-source-map',
    watch: true,
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify("development"),
        'process.env.VERSION': JSON.stringify(require("./package.json").version)
      })
    ],
  });
