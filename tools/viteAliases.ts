// tools/viteAliases.ts
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

export const alias: Record<string, string> = {
  '@shared': path.resolve(projectRoot, '../../shared'),
  '@assets': path.resolve(projectRoot, 'assets'),
  '@': path.resolve(projectRoot, 'src'),
}
