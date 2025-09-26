// src/configMaker/composables/usePresetOperations.ts
import { useCommentCutterStore } from '../../stores/pluginStore'
import type { PresetType } from '../../types/type'

export const usePresetOperations = () => {
  const store = useCommentCutterStore()

  // 新しいプリセットの作成
  const createNewPresetData = (): Partial<PresetType> => {
    return {
      id: `preset_${Date.now()}`,
      name: '新しいプリセット',
      description: '',
      isBlacklist: true,
      isFilterSpeech: false,
      threshold: {
        conditions: [],
      },
    }
  }

  // プリセット追加
  const addNewPreset = async () => {
    try {
      const newPresetData = createNewPresetData()
      const newPreset = store.addPreset(newPresetData)

      // 追加されたプリセットを自動選択
      store.selectPreset(newPreset.id)

      return newPreset
    } catch (error) {
      console.error('Failed to duplicate preset:', error)
      throw error
    }
  }

  // プリセットの一括操作
  const bulkOperations = {
    // 全プリセットのエクスポート
    exportAllPresets: () => {
      const exportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        presets: store.data.presets,
      }
      return JSON.stringify(exportData, null, 2)
    },

    // プリセットのインポート
    importPresets: async (importData: string) => {
      try {
        const parsed = JSON.parse(importData)
        if (!parsed.presets) {
          throw new Error('Invalid import data format')
        }

        // 既存のプリセットと重複しないようにIDを調整
        const newPresets = { ...store.data.presets }
        Object.values(parsed.presets).forEach((preset: any) => {
          const newId = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          newPresets[newId] = {
            ...preset,
            id: newId,
            name: `${preset.name} (インポート)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        })

        store.setData({ presets: newPresets })
        console.log('Presets imported successfully')
      } catch (error) {
        console.error('Failed to import presets:', error)
        throw error
      }
    },
  }

  // 現在のプリセットを削除
  const deleteCurrentPreset = async () => {
    if (!store.selectedPresetId) {
      throw new Error('No preset selected for deletion')
    }

    const confirmed = confirm('このプリセットを削除しますか？')
    if (!confirmed) {
      return
    }

    try {
      const presetIdToDelete = store.selectedPresetId
      store.removePreset(presetIdToDelete)

      // 他のプリセットがあれば最初のものを選択
      const remainingPresets = Object.keys(store.data.presets)
      if (remainingPresets.length > 0) {
        store.selectPreset(remainingPresets[0])
      }
    } catch (error) {
      console.error('Failed to delete preset:', error)
      throw error
    }
  }

  // 現在のプリセットを複製
  const duplicateCurrentPreset = async () => {
    if (!store.selectedPresetId) {
      throw new Error('No preset selected for duplication')
    }

    try {
      const duplicatedPreset = store.duplicatePreset(store.selectedPresetId)

      // 複製されたプリセットを選択
      store.selectPreset(duplicatedPreset.id)

      return duplicatedPreset
    } catch (error) {
      console.error('Failed to duplicate preset:', error)
      throw error
    }
  }

  return {
    addNewPreset,
    deleteCurrentPreset,
    duplicateCurrentPreset,
    bulkOperations,
  }
}
