// vite.config.ts
import { defineConfig, mergeConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { baseViteConfig } from '../../shared/utils/ViteConfig/viteConfigBase'
import { alias } from './tools/viteAliases'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const base = baseViteConfig(__dirname)

export default defineConfig(() => {
  return mergeConfig(base, {
    resolve: { alias },
  })
})
