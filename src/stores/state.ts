// src/stores/commentCutter/state.ts
import { ref } from 'vue'
import { DataSchema, DataSchemaType } from '@/types/type'

export const createState = () => ({
  data: ref<DataSchemaType>(DataSchema.parse({})),
  isInitialized: ref(false),
  lastError: ref<string | null>(null),
  isDirty: ref(false),
  electronStore: ref<any>(null),
  storeKey: ref<string>('pluginData'),
  isEditorMode: ref(false),
  selectedPresetId: ref<string | null>(null),
  isPresetDialogOpen: ref(false),
})
