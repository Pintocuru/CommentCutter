// src/configMaker/composables/usePresetOperations.ts
import { useCommentCutterStore } from '../../stores/pluginStore'

export const usePresetOperations = () => {
  const store = useCommentCutterStore()

  // プリセット追加
  const addNewPreset = async () => {
    try {
      const newPreset = store.addPreset({})
      store.selectPreset(newPreset.key) // 追加されたプリセットを自動選択
      return newPreset
    } catch (error) {
      console.error('Failed to duplicate preset:', error)
      throw error
    }
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
  }
}
