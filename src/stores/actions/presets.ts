// src/stores/commentCutter/actions/presets.ts
import { PresetSchema, PresetType } from '@/types/type'
import { createState } from '../state'
import { createCoreActions } from './core'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'

export const createPresetActions = (
  state: ReturnType<typeof createState>,
  coreActions: ReturnType<typeof createCoreActions>
) => {
  const addPreset = (raw: Partial<PresetType>) => {
    try {
      const newPreset = PresetSchema.parse(raw)

      const newPresets = {
        ...state.data.value.presets,
        [newPreset.id]: newPreset,
      }
      coreActions.setData({ presets: newPresets })

      state.selectedPresetId.value = newPreset.id

      return newPreset
    } catch (error) {
      ConsolePost('error', `プリセットの追加に失敗しました: ${error}`)
      throw error
    }
  }

  const updatePreset = (presetId: string, updates: Partial<PresetType>) => {
    try {
      const original = state.data.value.presets[presetId]
      if (!original) throw new Error('プリセットが見つかりません')

      const updated: PresetType = {
        ...original,
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      const newPresets = {
        ...state.data.value.presets,
        [presetId]: updated,
      }
      coreActions.setData({ presets: newPresets })
    } catch (error) {
      ConsolePost('error', `プリセットの更新に失敗しました: ${error}`)
      throw error
    }
  }

  const removePreset = (presetId: string) => {
    try {
      const { [presetId]: _, ...rest } = state.data.value.presets
      coreActions.setData({ presets: rest })

      if (state.data.value.target === presetId) {
        coreActions.setData({ target: '' })
      }

      if (state.selectedPresetId.value === presetId) {
        state.selectedPresetId.value = null
      }
    } catch (error) {
      ConsolePost('error', `プリセットの削除に失敗しました: ${error}`)
      throw error
    }
  }

  const duplicatePreset = (presetId: string) => {
    try {
      const originalPreset = state.data.value.presets[presetId]
      if (!originalPreset) throw new Error('プリセットが見つかりません')

      const duplicatedPreset = {
        ...originalPreset,
        id: `${presetId}_copy_${Date.now()}`,
        name: `${originalPreset.name} のコピー`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return addPreset(duplicatedPreset)
    } catch (error) {
      ConsolePost('error', `プリセットの複製に失敗しました: ${error}`)
      throw error
    }
  }

  const setActivePreset = (presetId: string) => {
    const preset = state.data.value.presets[presetId]
    if (!preset) {
      ConsolePost('error', `指定されたプリセットが見つかりません`)
      throw new Error('Preset not found')
    }
    coreActions.setData({ target: presetId })
  }

  const clearActivePreset = () => {
    coreActions.setData({ target: '' })
  }

  const validatePreset = (preset: Partial<PresetType>): string[] => {
    const errors: string[] = []

    if (!preset.name || preset.name.trim().length === 0) {
      errors.push('プリセット名は必須です')
    }

    if (preset.name && preset.name.trim().length > 50) {
      errors.push('プリセット名は50文字以内で入力してください')
    }

    if (preset.name && preset.id) {
      const duplicates = Object.values(state.data.value.presets).find(
        (p) => p.name === preset.name && p.id !== preset.id
      )
      if (duplicates) {
        errors.push('同じ名前のプリセットが既に存在します')
      }
    }

    return errors
  }

  return {
    addPreset,
    updatePreset,
    removePreset,
    duplicatePreset,
    setActivePreset,
    clearActivePreset,
    validatePreset,
  }
}
