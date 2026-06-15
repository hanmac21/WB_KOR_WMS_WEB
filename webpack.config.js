const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/main/webapp/resources/js/entry.js',
  output: {
    path: path.resolve(__dirname, 'src/main/webapp/resources/dist'),
    filename: 'bundle.js',
  },

  externals: {
	jquery: 'jQuery'   
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new webpack.DefinePlugin({
      // 예: 'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  mode: 'development',
  devServer: {
    static: path.resolve(__dirname, 'src/main/webapp/resources'),
    port: 8081,
    open: true,
    watchFiles: ['src/main/webapp/resources/**/*.js']
  }
};
