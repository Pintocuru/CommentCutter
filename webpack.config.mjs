// webpack.config.mjs
import path from 'path'
import { fileURLToPath } from 'url'
import TerserPlugin from 'terser-webpack-plugin'
import fs from 'fs'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const tsconfig = JSON.parse(fs.readFileSync(path.resolve(dirname, './tsconfig.json'), 'utf-8'))

function createAliases(baseDir) {
  const aliases = {}
  const paths = tsconfig.compilerOptions?.paths ?? {}
  for (const [key, valueArr] of Object.entries(paths)) {
    const cleanKey = key.replace('/*', '')
    const target = valueArr[0].replace('/*', '')
    aliases[cleanKey] = path.resolve(baseDir, target)
  }
  return aliases
}

/** @type {import('webpack').Configuration} */
const config = {
  mode: 'production',
  target: 'node',
  entry: {
    main: path.resolve(dirname, './src/MainPlugin/plugin.ts'),
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: createAliases(dirname),
    fallback: { path: false },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{ loader: 'ts-loader', options: { configFile: path.resolve(dirname, 'tsconfig.json') } }],
        exclude: /node_modules/,
      },
    ],
  },
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

export default config
