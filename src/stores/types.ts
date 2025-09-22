// src/stores/commentCutter/types.ts
import { DataSchemaType } from '@/types/type'

export interface StoreState {
  data: DataSchemaType
  isInitialized: boolean
  lastError: string | null
  isDirty: boolean
  electronStore: any
  storeKey: string
  isEditorMode: boolean
  selectedPresetId: string | null
  isPresetDialogOpen: boolean
}
