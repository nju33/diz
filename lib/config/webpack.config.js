import path from 'path';
import webpack from 'webpack';

export default {
  devtool: '#eval-source-map',

  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false
  },

  context: path.resolve(__dirname, '../..'),

  node: {
    console: false,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },

  resolve: {
    modules: [
      path.resolve(process.cwd(), 'node_modules/'),
      path.resolve(__dirname, '../../node_modules/')
    ],
    extensions: ['.jsx', '.js', '.json']
  },

  entry: [
    'babel-polyfill'
    // 'webpack/hot/dev-server',
    // 'webpack-hot-middleware/client'
    // entryFile
  ],

  output: {
    path: path.resolve(__dirname, '../../example/dist/blog/scripts/'),
    publicPath: '/scripts/',
    filename: 'bundle.js'
  },

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.(?:js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  browsers: ['last 2 versions', '> 3%'],
                  modules: false,
                  useBuildIns: true
                }],
                'react'
              ],
              plugins: [
                'transform-async-to-generator',
                'transform-class-properties',
                'transform-object-rest-spread',
                'transform-decorators-legacy'
              ]
            }
          }
        ]
      },
      {
        test: /^diz-theme-.*?\/style.css/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          }
        ]
      }
    ]
  }
};
