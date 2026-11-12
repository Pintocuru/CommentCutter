// vite.config.ts
import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import checker from 'vite-plugin-checker'
import { alias } from './tools/viteAliases'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  root: __dirname,
  plugins: [
    vue(),
    tailwindcss(),
    checker({
      overlay: { initialIsOpen: 'error' },
      terminal: true,
    }),
  ],
  css: { postcss: { plugins: [] } },
  resolve: { alias },
})
