var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CommonsChunkPlugin=require('webpack/lib/optimize/CommonsChunkPlugin');

module.exports = {
    entry: [
      //'webpack/hot/dev-server',
      //'webpack-dev-server/client?http://localhost:8080',
      path.resolve(__dirname, 'public/javascript/main.js')
    ],
    output:{
        path:path.resolve(__dirname,'public/javascript'),
        filename:'bundle.js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
    loaders:[
      {test: /\.jsx?$/,loader: 'babel', exclude: /node_modules/,query: {cacheDirectory: true,presets: ['react', 'es2015']}},
      {test: /\.css$/, loader: ExtractTextPlugin.extract('style','css')},
      { test: /\.less$/, loader: 'style!css!less'},
      // { test: /\.less$/, loader: ExtractTextPlugin.extract('style','css','less')},
      // { test: /\.scss$/, loader: 'style!css!sass'}
      { test: /\.scss$/, loader: ExtractTextPlugin.extract('style','css!sass')}
  	],
  	noParse: [pathToReact]
	},
  babel: {
        presets: ['es2015', 'stage-0', 'react'],
        plugins: ["transform-runtime",['antd', { 'style': "css"}]]
    },
  plugins: [
      // new CommonsChunkPlugin('commons.js'),
      new ExtractTextPlugin('../stylesheets/main.css')
    ]
};
