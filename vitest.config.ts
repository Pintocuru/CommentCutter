// vitest.config.ts

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: [path.resolve(__dirname, 'src/test-setup.ts')],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
      '@shared': path.resolve(__dirname, '../../shared/'),
      '@assets': path.resolve(__dirname, './assets/'),
    },
  },
})
