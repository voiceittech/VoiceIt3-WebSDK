const path = require('path');
const webpack = require('webpack');
const basePath = path.resolve(__dirname);

module.exports = {
  context: path.join(basePath, 'src'),
  entry: './index.js',
  mode:      'production',
  optimization: {
    minimize: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use:['style-loader','css-loader']
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        use: ['url-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: ['url-loader']
      }
    ]
  },
  output: {
    path: path.join(basePath, 'dist'),
    filename: 'voiceit3.min.js',
    libraryTarget: 'umd',
    library : 'VoiceIt3'
  },
  resolve: {
        alias: {
            videojs: 'video.js',
            WaveSurfer: 'wavesurfer.js',
            wavesurfer: 'videojs-wavesurfer/dist/videojs.wavesurfer.js'
        }
  },
  plugins: [
        new webpack.ProvidePlugin({
            videojs: 'video.js/dist/video.cjs.js',
        })
  ]
};
