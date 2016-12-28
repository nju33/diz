import path from 'path';
import webpack from 'webpack';

module.exports = {
  make(cwd, {demoContents, srcContents}, outputPath) {
    return {
      devtool: '#eval-source-map',
      context: path.join(__dirname, '../..'),

      resolve: {
        modules: [
          path.resolve(__dirname, '../node_modules/'),
          path.resolve(__dirname, 'components/'),
          'node_modules/'
        ],
        extensions: ['.jsx', '.js', '.json']
      },

      entry: [
        'webpack/hot/dev-server',
        'webpack-hot-middleware/client',
        path.resolve(__dirname, '../app/main.jsx')
      ],

      output: {
        path: outputPath,
        publicPath: '/scripts/',
        filename: 'index.js'
      },

      plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
      ],

      module: {
        loaders: [
          {
            test: /\.jsx$/,
            exclude: /node_modules/,
            loaders: [
              {
                loader: 'babel',
                query: {
                  presets:  ['es2015', 'react', 'stage-1'],
                  plugins:[
                    'react-hot-loader/babel',
                    'transform-object-rest-spread',
                    'transform-decorators-legacy'
                  ]
                }
              }
            ]
          }
        ]
      }
    }
  }
};
