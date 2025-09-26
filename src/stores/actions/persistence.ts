// src\stores\actions\persistence.ts
import { DataSchema } from '@/types/type'
import { createState } from '../state'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'

export const createPersistenceActions = (state: ReturnType<typeof createState>) => {
  const save = async (resource: string = 'save'): Promise<void> => {
    if (!state.apiClient.value) {
      throw new Error('API client is not available')
    }

    try {
      await state.apiClient.value.post(resource, state.data.value)
      ConsolePost('info', 'データを保存しました')
    } catch (error) {
      ConsolePost('error', `データの保存に失敗しました: ${error}`)
      throw error
    }
  }

  const autoSave = async (): Promise<void> => {
    if (state.apiClient.value && state.isInitialized.value) {
      try {
        await state.apiClient.value.post('save', state.data.value)
        console.log('Auto-saved data via API')
      } catch (error) {
        console.error('Auto-save failed:', error)
        ConsolePost('error', `自動保存に失敗しました: ${error}`)
      }
    }
  }

  const load = async (resource: string = 'data'): Promise<void> => {
    if (!state.apiClient.value) {
      throw new Error('API client is not available')
    }

    try {
      const savedData = await state.apiClient.value.get(resource)
      state.data.value = DataSchema.parse(savedData)
      ConsolePost('info', 'データを読み込みました')
    } catch (error) {
      ConsolePost('error', `データの読み込みに失敗しました: ${error}`)
      throw error
    }
  }

  // 特定のプリセットを取得
  const loadPreset = async (presetId: string) => {
    if (!state.apiClient.value) {
      throw new Error('API client is not available')
    }

    try {
      const response = await state.apiClient.value.get(`preset/${presetId}`)
      if (response.success && response.preset) {
        return response.preset
      }
      throw new Error('Preset not found')
    } catch (error) {
      ConsolePost('error', `プリセットの読み込みに失敗しました: ${error}`)
      throw error
    }
  }

  // ステータス取得
  const getStatus = async () => {
    if (!state.apiClient.value) {
      throw new Error('API client is not available')
    }

    try {
      const response = await state.apiClient.value.get('status')
      return response.status
    } catch (error) {
      ConsolePost('error', `ステータス取得に失敗しました: ${error}`)
      throw error
    }
  }

  const destroy = async (): Promise<void> => {
    try {
      await autoSave()
      state.apiClient.value = null
      console.log('Store destroyed and cleaned up')
    } catch (error) {
      console.error('Store destroy error:', error)
    }
  }

  return {
    save,
    autoSave,
    load,
    loadPreset,
    getStatus,
    destroy,
  }
}
