 var path=require('path');
 var config = {
   entry: './main.js',
   output: {
      path:'./',
      publicPath: '/',
      filename: 'index.js',
      // publicPath:'http://localhost:7777/'
   },
   devServer: {
      port:7777,
      inline: true,
      host: '0.0.0.0' 
   },
   module: {
      loaders: [ 
      {
         test: /\.jsx?$/,
         exclude: /node_modules/,
         loader: 'babel',
         query: {
            presets: ['es2015', 'react']
         } 
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.(jpg|png)$/, loader: "url" }
      ]
   },

   // 上线的时候打开--主要功能是压缩代码
   /*,
   new webpack.optimize.UglifyJsPlugin({
      compress: {
          warnings: false
      }
   }),
   new webpack.DefinePlugin({ //显示告警信息
      'process.env': {
          NODE_ENV: JSON.stringify('production')
      }
   })*/
	
}

module.exports = config;