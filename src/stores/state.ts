// src/stores/commentCutter/state.ts
import { ref } from 'vue'
import { DataSchema, DataSchemaType } from '@/types/type'

export const createState = () => ({
  data: ref<DataSchemaType>(DataSchema.parse({})),
  isInitialized: ref(false),
  electronStore: ref<any>(null),
  storeKey: ref<string>('pluginData'),
  selectedPresetId: ref<string | null>(null),
})
