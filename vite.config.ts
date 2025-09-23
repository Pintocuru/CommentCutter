// vite.config.ts
import { defineConfig, mergeConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { baseViteConfig, rootAlias } from '../../shared/utils/ViteConfig/viteConfigBase'
import tsconfig from './tsconfig.json'

// __dirname の設定
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const base = baseViteConfig(__dirname)

// tsconfig.json からエイリアスを生成
const tsAliases = createViteAliases(__dirname)
export const alias = { ...rootAlias, ...tsAliases }

export default defineConfig(() => {
  return mergeConfig(base, {
    // ビルド設定
    build: {
      // ライブラリモードで構築
      lib: {
        entry: path.resolve(__dirname, 'src/MainPlugin/plugin.ts'),
        name: 'Plugin',
        fileName: () => 'plugin.js',
        formats: ['cjs'], // 出力形式をCommonJSに指定
      },

      // 出力ディレクトリ
      outDir: 'dist',
      emptyOutDir: true,

      // ロールアップ設定
      rollupOptions: {
        // 外部依存関係の指定
        external: [
          'fs',
          'fs/promises',
          'path',
          'crypto',
          'util',
          'events',
          'stream',
          'buffer',
          'os',
          'url',
          'querystring',
          '@onecomme.com/onesdk',
          'electron-store',
        ],
        output: {
          // デフォルトエクスポートをCommonJSのexportsに直接変換
          exports: 'default',
        },
      },

      // ミニファイ設定
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true,
        },
        mangle: {
          // 特定の関数名は保持
          reserved: ['init', 'request', 'subscribe', 'destroy', 'filterComment', 'filterSpeech'],
        },
      },

      // ソースマップ生成
      sourcemap: false,

      // チャンクサイズ警告の無効化
      chunkSizeWarningLimit: 1000,
    },

    // 解決設定
    resolve: { alias: alias },
    test: {
      // コンソールメッセージを有効にする
      silent: false,
      // その他の設定
      globals: true,
    },
  })
})

// tsconfig.json の paths を Vite の resolve.alias 形式に変換する関数
export function createViteAliases(baseDir: string): Record<string, string> {
  const aliases: Record<string, string> = {}
  const paths = tsconfig.compilerOptions.paths

  // paths が存在しない場合は空のオブジェクトを返す
  if (!paths) return aliases

  // tsconfig.json のパスを Vite の形式に変換
  type PathsType = typeof tsconfig.compilerOptions.paths
  for (const alias of Object.keys(paths) as (keyof PathsType)[]) {
    const value = paths[alias][0]
    const key = alias.replace('/*', '')
    // `/*` を取り除き、`path.resolve` で絶対パスに変換
    aliases[key] = path.resolve(baseDir, value.replace('/*', ''))
  }

  return aliases
}
