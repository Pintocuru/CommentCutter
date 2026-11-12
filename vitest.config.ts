// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { alias } from './tools/viteAliases'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    globals: true,
    setupFiles: [path.resolve(__dirname, 'src/test-setup.ts')],
  },
  resolve: {
    alias,
  },
})
