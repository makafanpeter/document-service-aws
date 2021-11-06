const path = require('path');

module.exports = {
  entry: {
    'lambda': './src/lambda.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]/[name].js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader' }]
  },
  devtool: 'source-map',
  mode: 'production',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  externals: ['aws-sdk'],
  target: 'node'
};