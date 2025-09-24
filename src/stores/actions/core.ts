// src/stores/commentCutter/actions/core.ts
import { DataSchema, DataSchemaType } from '@/types/type'
import { createState } from '../state'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'

export const createCoreActions = (state: ReturnType<typeof createState>) => {
  const setData = (newData: Partial<DataSchemaType>) => {
    try {
      const oldData = { ...state.data.value }
      state.data.value = DataSchema.parse({ ...state.data.value, ...newData })
      state.isDirty.value = true

      if (!state.isEditorMode.value) {
        console.log('Plugin data updated:', { oldData, newData: state.data.value })
      }
    } catch (error) {
      ConsolePost('error', `データの更新に失敗しました: ${error}`)
      console.error('Store update error:', error)
      throw error
    }
  }

  const initialize = (initialData: DataSchemaType, editorMode = false, apiStore?: any, storageKey = 'pluginData') => {
    try {
      // 💡 元データを壊さないためにクローン
      const cloned = JSON.parse(JSON.stringify(initialData ?? {}))

      // 💡 スキーマで補完しつつ parse
      state.data.value = DataSchema.parse(cloned)

      state.isInitialized.value = true
      state.isEditorMode.value = editorMode
      state.isDirty.value = false

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
      state.isDirty.value = true

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
      state.isDirty.value = true

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
      state.isDirty.value = true

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
