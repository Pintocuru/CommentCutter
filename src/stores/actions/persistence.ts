// src/stores/commentCutter/actions/persistence.ts
import { DataSchema, DataSchemaType } from '@/types/type'
import { createState } from '../state'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'

export const createPersistenceActions = (state: ReturnType<typeof createState>) => {
  const save = async (saveHandler?: (data: DataSchemaType) => Promise<void>) => {
    try {
      if (saveHandler) {
        await saveHandler(state.data.value)
      } else if (state.electronStore.value) {
        state.electronStore.value.set(state.storeKey.value, state.data.value)
      }
    } catch (error) {
      ConsolePost('error', `データの保存に失敗しました: ${error}`)
      throw error
    }
  }

  const autoSave = async () => {
    if (state.electronStore.value) {
      try {
        state.electronStore.value.set(state.storeKey.value, state.data.value)
        console.log('Auto-saved plugin data')
      } catch (error) {
        console.error('Auto-save failed:', error)
        ConsolePost('error', `自動保存に失敗しました: ${error}`)
      }
    }
  }

  const persistToFile = async () => {
    if (!state.electronStore.value) {
      throw new Error('electron-store is not available')
    }

    try {
      state.electronStore.value.set(state.storeKey.value, state.data.value)
      console.log('Data persisted to file')
    } catch (error) {
      ConsolePost('error', `ファイルへの保存に失敗しました: ${error}`)
      throw error
    }
  }

  const loadFromFile = () => {
    if (!state.electronStore.value) {
      throw new Error('electron-store is not available')
    }

    try {
      const savedData = state.electronStore.value.get(state.storeKey.value, {})
      state.data.value = DataSchema.parse(savedData)
      console.log('Data loaded from file')
    } catch (error) {
      ConsolePost('error', `ファイルからの読み込みに失敗しました: ${error}`)
      throw error
    }
  }

  const destroy = async () => {
    try {
      await autoSave()

      // reset処理は外部から呼び出す
      state.electronStore.value = null
      state.storeKey.value = 'pluginData'

      console.log('Store destroyed and cleaned up')
    } catch (error) {
      console.error('Store destroy error:', error)
    }
  }

  return {
    save,
    autoSave,
    persistToFile,
    loadFromFile,
    destroy,
  }
}
