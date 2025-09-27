// webpackBuild.ts
import { WebpackRunner } from '../../shared/utils/webpackBuild/core/webpackRunner'
import webpack from 'webpack'
import path from 'path'
import { fileURLToPath } from 'url'
import { VueLoaderPlugin } from 'vue-loader'
import TerserPlugin from 'terser-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { createExternals } from '../../shared/utils/webpackBuild/buildOptions/externals'
import { createModuleRules } from '../../shared/utils/webpackBuild/buildOptions/moduleRules'
import tsconfig from './tsconfig.json'
import { createAliases } from '../../shared/utils/webpackBuild/utils/createAliases'
import { createResolveConfig } from '../../shared/utils/webpackBuild/buildOptions/resolve'

// __dirname の設定
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const aliases = createAliases(__dirname, tsconfig)

const config: webpack.Configuration = {
  mode: 'production',
  entry: {
    main: path.resolve(__dirname, './src/ConfigMaker/main.ts'),
  },
  output: {
    filename: 'scripts/[name].js',
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: createResolveConfig(aliases, __dirname),
  externals: createExternals(),
  module: { rules: createModuleRules() },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'assets/index.html'), // ここでHTMLテンプレート指定
      inject: 'body',
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      automaticNameDelimiter: '-',
      cacheGroups: {
        pinia: {
          test: /[\\/]node_modules[\\/]pinia[\\/]/,
          name: 'pinia-vendor',
          chunks: 'all',
          enforce: true,
        },
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            return 'vendors'
          },
          chunks: 'all',
          priority: -10,
        },
      },
    },
    minimize: true,
    minimizer: [new TerserPlugin({ extractComments: false })],
  },
}

async function build() {
  try {
    console.log('[Build] Starting webpack build with TypeScript configuration...')

    const runner = new WebpackRunner()
    await runner.run(config)

    console.log('[Build] Build completed successfully!')
  } catch (error) {
    console.error('[Build] Build failed:', error)
    process.exit(1)
  }
}

build()
