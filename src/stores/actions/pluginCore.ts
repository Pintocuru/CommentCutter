// src/stores/commentCutter/actions/pluginCore.ts
import { DataSchema, DataSchemaType } from '@/types/type'
import { createState } from '../state'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'
import ElectronStore from 'electron-store'

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

  const initialize = (
    initialData: DataSchemaType,
    apiStore?: ElectronStore<Record<string, unknown>>,
    storageKey = 'pluginData'
  ) => {
    try {
      // 💡 元データを壊さないためにクローン
      const cloned = JSON.parse(JSON.stringify(initialData ?? {}))

      // 💡 スキーマで補完しつつ parse
      state.data.value = DataSchema.parse(cloned)

      state.isInitialized.value = true

      if (apiStore) {
        state.electronStore.value = apiStore
        state.storeKey.value = storageKey
      }
    } catch (error) {
      ConsolePost('error', `初期化に失敗しました: ${error}`)
      console.error('Store initialization error:', error)
      throw error
    }
  }

  // 新しく追加するメソッド
  const updateData = (newData: DataSchemaType) => {
    try {
      // DataSchemaでバリデーション
      const validatedData = DataSchema.parse(newData)

      // データ全体を置き換え
      state.data.value = validatedData

      console.log('Store data updated successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
      ConsolePost('error', `データの更新に失敗しました: ${errorMessage}`)
      console.error('Store data update failed:', error)
      throw error
    }
  }

  // データの部分更新（既存のsetDataと似ているが、より安全）
  const updateDataPartial = (updates: Partial<DataSchemaType>) => {
    try {
      const newData = { ...state.data.value, ...updates }

      // 部分更新でもバリデーションを行う
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

      console.log('Store data reset to default')
    } catch (error) {
      ConsolePost('error', `データのリセットに失敗しました: ${error}`)
      throw error
    }
  }

  return {
    setData,
    initialize,
    reset,
    updateData,
    updateDataPartial,
  }
}
