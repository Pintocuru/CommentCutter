// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'
import { alias } from './tools/viteAliases'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: [path.resolve(__dirname, 'src/test-setup.ts')],
  },
  resolve: {
    alias,
  },
})
