// src\stores\actions\pluginCore.ts
import { DataSchema, DataSchemaType } from '@/types/type'
import { createState } from '../state'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'

export const createCoreActions = (state: ReturnType<typeof createState>) => {
  const setData = (newData: Partial<DataSchemaType>) => {
    try {
      state.data.value = DataSchema.parse({ ...state.data.value, ...newData })
    } catch (error) {
      ConsolePost('error', `データの更新に失敗しました: ${error}`)
      console.error('Store update error:', error)
      throw error
    }
  }

  const initialize = async (apiClient: DataSchemaType) => {
    try {
      state.data.value = apiClient
      state.isInitialized.value = true

      ConsolePost('info', 'ストアを読み込みました')
    } catch (error) {
      // 初期化エラーの場合はデフォルトデータで初期化を続行
      console.warn('Failed to load data from API, using default data:', error)
      state.data.value = DataSchema.parse({})
      state.isInitialized.value = true

      ConsolePost('warn', 'デフォルトデータでストアを初期化しました')
    }
  }

  const updateData = (newData: DataSchemaType) => {
    try {
      const validatedData = DataSchema.parse(newData)
      state.data.value = validatedData
      console.log('Store data updated successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
      ConsolePost('error', `データの更新に失敗しました: ${errorMessage}`)
      console.error('Store data update failed:', error)
      throw error
    }
  }

  const updateDataPartial = (updates: Partial<DataSchemaType>) => {
    try {
      const newData = { ...state.data.value, ...updates }
      const validatedData = DataSchema.parse(newData)
      state.data.value = validatedData
      console.log('Store data partially updated successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
      ConsolePost('error', `データの部分更新に失敗しました: ${errorMessage}`)
      console.error('Store data partial update failed:', error)
      throw error
    }
  }

  const reset = () => {
    try {
      const defaultData = DataSchema.parse({})
      state.data.value = defaultData
      state.hasChanged.value = true
      console.log('Store data reset to default')
    } catch (error) {
      ConsolePost('error', `データのリセットに失敗しました: ${error}`)
      throw error
    }
  }

  const syncFromApi = async (resource: string = 'data') => {
    if (!state.apiClient.value) {
      throw new Error('API client is not available')
    }

    try {
      const apiData = await state.apiClient.value.get(resource)

      if (resource === 'data') {
        const validatedData = DataSchema.parse(apiData)
        state.data.value = validatedData
        ConsolePost('info', 'APIからデータを同期しました')
      }

      return apiData
    } catch (error) {
      ConsolePost('error', `API同期に失敗しました: ${error}`)
      throw error
    }
  }

  return {
    setData,
    initialize,
    reset,
    updateData,
    updateDataPartial,
    syncFromApi,
  }
}
