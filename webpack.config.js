var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/Compress.js',
  output: {
    path: path.resolve(__dirname, ''),
    filename: 'index.js',
    library: 'Compress',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'stage-3']
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    })
  ],
  stats: {
    colors: true
  },
  devtool: 'source-map'
}
