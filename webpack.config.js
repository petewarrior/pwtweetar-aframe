const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

require('dotenv').config();
// const { argv, env } = require('process');
// require("regenerator-runtime");

// console.log(`mode: ${argv.env}`);
// Try the environment variable, otherwise use root
// const ASSET_PATH = process.env.ASSET_PATH || './public';

module.exports = (_env, argv) => {
  // console.log('params', [env, argv, process.env]);
  const env = process.env;
  const config = {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      // publicPath: ASSET_PATH,
      filename: '[name].[contenthash].js',
    },
    devServer: {
      contentBase: './dist',
      writeToDisk: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ]
    },
    plugins: [
      new CopyPlugin({
        patterns: [{ from: 'assets/models', to: 'assets/models' }],
      }),
      new HtmlWebpackPlugin({
        // appMountId: 'app',
        title: argv.mode === 'production' ? 'PWTweetAR' : 'PWTweetAR Dev',
        template: 'src/index.html',
        inject: false,
        templateParameters: {
          'ga': argv.mode === 'production' && env && env.GA && env.GA.length > 0 ? `
            <!-- Global site tag (gtag.js) - Google Analytics -->
            <script async src="https://www.googletagmanager.com/gtag/js?id=${env.GA}"></script>
            <script>
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            
              gtag('config', '${env.GA}');
            </script>          
          ` : '',
        },
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
      }),
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/)
    ]
  };

  if(argv.mode === 'development') {
    config.devtool = 'inline-source-map';
    Object.assign(config, {
      devtool: 'inline-source-map',
    });
  }

  if(argv.mode === 'production') {
    Object.assign(config, {
      optimization: {
        runtimeChunk: true, // 'single',
        splitChunks: {
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            }
          }
        }
      },
    });  
    config.plugins.push(new CleanWebpackPlugin());  
  }

  return config;
};

// module.exports = config;