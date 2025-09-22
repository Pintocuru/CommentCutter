// src/stores/commentCutter/actions/presets.ts
import { PresetType } from '@/types/type'
import { createState } from '../state'
import { createCoreActions } from './core'

export const createPresetActions = (
  state: ReturnType<typeof createState>,
  coreActions: ReturnType<typeof createCoreActions>
) => {
  const addPreset = (preset: Omit<PresetType, 'id'> & { id?: string }) => {
    try {
      const newPreset: PresetType = {
        ...preset,
        id: preset.id || `preset_${Date.now()}`,
        createdAt: preset.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const newPresets = [...state.data.value.presets, newPreset]
      coreActions.setData({ presets: newPresets })

      if (state.isEditorMode.value) {
        state.selectedPresetId.value = newPreset.id
      }

      return newPreset
    } catch (error) {
      state.lastError.value = 'プリセットの追加に失敗しました'
      throw error
    }
  }

  const updatePreset = (presetId: string, updates: Partial<PresetType>) => {
    try {
      const newPresets = state.data.value.presets.map((preset) =>
        preset.id === presetId ? { ...preset, ...updates, updatedAt: new Date().toISOString() } : preset
      )
      coreActions.setData({ presets: newPresets })
    } catch (error) {
      state.lastError.value = 'プリセットの更新に失敗しました'
      throw error
    }
  }

  const removePreset = (presetId: string) => {
    try {
      const newPresets = state.data.value.presets.filter((preset) => preset.id !== presetId)
      coreActions.setData({ presets: newPresets })

      if (state.data.value.target === presetId) {
        coreActions.setData({ target: '' })
      }

      if (state.selectedPresetId.value === presetId) {
        state.selectedPresetId.value = null
      }
    } catch (error) {
      state.lastError.value = 'プリセットの削除に失敗しました'
      throw error
    }
  }

  const duplicatePreset = (presetId: string) => {
    try {
      const originalPreset = state.data.value.presets.find((p) => p.id === presetId)
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
      state.lastError.value = 'プリセットの複製に失敗しました'
      throw error
    }
  }

  const setActivePreset = (presetId: string) => {
    const preset = state.data.value.presets.find((p) => p.id === presetId)
    if (!preset) {
      state.lastError.value = '指定されたプリセットが見つかりません'
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
      const duplicate = state.data.value.presets.find((p) => p.name === preset.name && p.id !== preset.id)
      if (duplicate) {
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
