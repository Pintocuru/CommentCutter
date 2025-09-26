// src\stores\state.ts
import { ref } from 'vue'
import { DataSchema, DataSchemaType } from '@/types/type'
import { ApiClient } from '../api/OneSdkApiClient'

export const createState = () => ({
  data: ref<DataSchemaType>(DataSchema.parse({})),
  hasChanged: ref(false), // 変更追跡
  isInitialized: ref(false),
  selectedPresetId: ref<string | null>(null),
  apiClient: ref<ApiClient | null>(null),
})
