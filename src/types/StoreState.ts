// src/stores/commentCutter/types.ts
import { DataSchemaType } from '@/types/type'

export interface StoreState {
  data: DataSchemaType
  isInitialized: boolean
  electronStore: any
  storeKey: string
  selectedPresetId: string | null
}
