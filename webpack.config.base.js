const path = require('path');
const appVersion = require("./package.json").version;

module.exports = {
  entry: './client/Index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.md$/,
        use: 'raw-loader'
      }]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'ImprovedInitiative.' + appVersion + '.js',
    path: path.resolve(__dirname, 'public', 'js')
  },
};
