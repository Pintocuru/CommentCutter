// src\types\test-setup.ts
import { vi } from 'vitest'

declare global {
  const vi: (typeof import('vitest'))['vi']
}
