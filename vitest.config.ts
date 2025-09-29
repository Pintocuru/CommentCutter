// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'
import tsconfig from './tsconfig.json'
import { createAliases } from '../../shared/utils/webpackBuild/utils/createAliases'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: [path.resolve(__dirname, 'src/test-setup.ts')],
  },
  resolve: {
    alias: createAliases(__dirname, tsconfig),
  },
})
