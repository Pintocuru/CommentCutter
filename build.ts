// build.ts
import { execSync } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { build, type InlineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { alias } from './tools/viteAliases'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = __dirname
const distDir = path.join(projectRoot, 'dist')

const baseConfig: Omit<InlineConfig, 'build'> = {
  configFile: false,
  root: projectRoot,
  base: './',
  mode: 'production',
  envDir: false,
  resolve: { alias },
}

async function main(): Promise<void> {
  console.log('[Check] Running vue-tsc...')
  execSync('npx vue-tsc --noEmit', { cwd: projectRoot, stdio: 'inherit' })

  await fs.rm(distDir, { recursive: true, force: true })
  await fs.mkdir(distDir, { recursive: true })

  console.log('[Build] Building CommentCutter Plugin...')
  await build({
    ...baseConfig,
    build: {
      outDir: distDir,
      emptyOutDir: false,
      minify: 'terser',
      terserOptions: {
        compress: { drop_console: false, drop_debugger: true },
        mangle: {
          reserved: ['init', 'request', 'subscribe', 'destroy', 'filterComment', 'filterSpeech'],
        },
      },
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      lib: {
        entry: path.resolve(projectRoot, 'src/MainPlugin/plugin.ts'),
        name: 'Plugin',
        fileName: () => 'plugin.js',
        formats: ['cjs'],
      },
      rollupOptions: {
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
          '@onecomme.com/onesdk/',
          'electron-store',
        ],
        output: { exports: 'default' },
      },
    },
  })

  console.log('[Build] Building ConfigMaker UI...')
  await build({
    ...baseConfig,
    plugins: [vue(), tailwindcss()],
    css: { postcss: { plugins: [] } },
    esbuild: { drop: ['console', 'debugger'] },
    build: {
      outDir: distDir,
      emptyOutDir: false,
      sourcemap: false,
      lib: {
        entry: path.resolve(projectRoot, 'src/ConfigMaker/main.ts'),
        name: 'CommentCutterConfigMaker',
        fileName: () => 'scripts/main.js',
        cssFileName: 'styles/main',
        formats: ['iife'],
      },
      rollupOptions: {
        external: ['vue', '@onecomme.com/onesdk'],
        output: {
          globals: { vue: 'Vue', '@onecomme.com/onesdk': 'OneSDK' },
          inlineDynamicImports: true,
          assetFileNames: 'assets/[name][extname]',
        },
      },
    },
  })

  await fs.copyFile(path.resolve(projectRoot, 'assets/index.html'), path.join(distDir, 'index.html'))

  const requiredFiles = ['plugin.js', 'index.html', 'scripts/main.js', 'styles/main.css']
  for (const file of requiredFiles) {
    const filePath = path.join(distDir, file)
    try {
      await fs.access(filePath)
    } catch {
      throw new Error(`[Build] Required output missing: ${filePath}`)
    }
  }

  console.log('[Build] CommentCutter build completed successfully!')
}

main().catch((error: unknown) => {
  console.error('[Build] CommentCutter build failed:', error)
  process.exitCode = 1
})
