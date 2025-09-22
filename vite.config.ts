// [Package] vite.config.ts
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

// ホットリロード用設定
export default defineConfig(() => {
  const checkLevel = process.env.VITE_TS_CHECK_LEVEL || 'development'

  return mergeConfig(base, {
    root: path.resolve(__dirname),
    resolve: { alias },
    server: {
      watch: {
        // server フォルダは更新してもホットリロードしない
        ignored: [path.resolve(__dirname, 'server/omikujiDatas/**')],
      },
    },
    // チェックレベルに応じた追加設定
    build: {
      rollupOptions:
        checkLevel === 'production'
          ? {
              onwarn: (warning: any, warn: (w: any) => void) => {
                if (warning.code === 'UNUSED_EXTERNAL_IMPORT') {
                  throw new Error(warning.message)
                }
                warn(warning)
              },
            }
          : {},
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
