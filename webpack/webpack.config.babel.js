const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const packageJson = require('../package.json');

const dllConfig = packageJson.dllConfig;
const compact = filterable => filterable.filter(Boolean);

module.exports = options => ({
  mode: options.development ? 'development' : 'production',

  devtool: options.development ? 'cheap-module-eval-source-map' : 'source-map',

  entry: {
    app: compact(['./app/index.tsx']),
    vendor: ['react', 'react-dom', 'react-router']
  },

  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/'
  },

  optimization: {
    minimize: !options.development,
    minimizer: [
      new TerserPlugin({
        cache: true,
        extractComments: false,
        parallel: true,
        sourceMap: true,
        terserOptions: {
          ecma: 6
        }
      }),
      new OptimizeCSSAssetsPlugin({})
    ],
    ...(options.development
      ? {}
      : {
          splitChunks: {
            name: 'vendor',
            minChunks: Infinity,
            filename: '[name].js'
          }
        })
  },

  plugins: getDependencyHandlers(options).concat(
    compact([
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          diagnosticOptions: {
            semantic: true,
            syntactic: true
          }
        }
      }),

      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!!options.development),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.UNSPLASH_APPLICATION_ID': JSON.stringify(
          process.env.UNSPLASH_APPLICATION_ID
        )
      }),

      options.development && new FriendlyErrorsPlugin(),
      options.development && new webpack.HotModuleReplacementPlugin(),

      // Make a separate css bundle for production
      new MiniCssExtractPlugin({
        filename: options.development ? '[name].css' : '[name].[hash].css',
        chunkFilename: options.development ? '[id].css' : '[id].[hash].css'
      }),

      // build a index.html with assets injected
      new HtmlWebpackPlugin({
        template: 'app/index.html',
        inject: true,
        hash: true,
        favicon: 'app/assets/favicon.ico',
        appName: packageJson.name,
        isDevelopment: options.development
      })
    ])
  ),

  resolve: {
    modules: [path.resolve(__dirname, '../'), 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        include: path.join(process.cwd(), 'app'),
        use: [
          {
            loader: 'babel-loader',
            options: { cacheDirectory: true }
          }
        ]
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: [
          options.development ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          options.development ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: options.development
                  ? '[name]__[local]___[hash:base64:5]'
                  : '[hash:base64:8]'
              },
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'postcss-import',
                  ['postcss-preset-env', { stage: 2 }]
                ]
              }
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|mp4|webm)/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      }
    ]
  },

  target: 'web'
});

function getDependencyHandlers(options) {
  if (!options.development) {
    return [];
  }

  const dllPath = path.resolve(process.cwd(), dllConfig.path);
  const manifestPath = path.resolve(dllPath, 'vendors.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(
      'The DLL manifest is missing. Please run `yarn run build:dll`'
    );
    process.exit(0);
  }

  return [
    new webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest: require(manifestPath) // eslint-disable-line
    })
  ];
}
