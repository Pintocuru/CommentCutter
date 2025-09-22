// src/stores/commentCutter/actions/core.ts
import { DataSchema, DataSchemaType } from '@/types/type'
import { createState } from '../state'

export const createCoreActions = (state: ReturnType<typeof createState>) => {
  const setData = (newData: Partial<DataSchemaType>) => {
    try {
      const oldData = { ...state.data.value }
      state.data.value = DataSchema.parse({ ...state.data.value, ...newData })
      state.isDirty.value = true
      state.lastError.value = null

      if (!state.isEditorMode.value) {
        console.log('Plugin data updated:', { oldData, newData: state.data.value })
      }
    } catch (error) {
      state.lastError.value = error instanceof Error ? error.message : 'データの更新に失敗しました'
      console.error('Store update error:', error)
      throw error
    }
  }

  const initialize = (
    initialData?: Partial<DataSchemaType>,
    editorMode = false,
    apiStore?: any,
    storageKey = 'pluginData'
  ) => {
    try {
      if (initialData) {
        state.data.value = DataSchema.parse(initialData)
      }
      state.isInitialized.value = true
      state.isEditorMode.value = editorMode
      state.isDirty.value = false
      state.lastError.value = null

      if (apiStore) {
        state.electronStore.value = apiStore
        state.storeKey.value = storageKey
      }
    } catch (error) {
      state.lastError.value = '初期化に失敗しました'
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
      state.lastError.value = null

      console.log('Store data updated successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
      state.lastError.value = `データの更新に失敗しました: ${errorMessage}`
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
      state.lastError.value = null

      console.log('Store data partially updated successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
      state.lastError.value = `データの部分更新に失敗しました: ${errorMessage}`
      console.error('Store data partial update failed:', error)
      throw error
    }
  }

  const reset = () => {
    try {
      const defaultData = DataSchema.parse({})
      state.data.value = defaultData
      state.isDirty.value = true
      state.lastError.value = null

      console.log('Store data reset to default')
    } catch (error) {
      state.lastError.value = 'データのリセットに失敗しました'
      throw error
    }
  }

  const clearError = () => {
    state.lastError.value = null
  }

  return {
    setData,
    initialize,
    reset,
    clearError,
    updateData, // 新規追加
    updateDataPartial, // 新規追加
  }
}
