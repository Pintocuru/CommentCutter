// src\stores\actions\presets.ts
import { PresetSchema, PresetType } from '@/types/type'
import { createState } from '../state'
import { createCoreActions } from './pluginCore'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'

export const createPresetActions = (
  state: ReturnType<typeof createState>,
  coreActions: ReturnType<typeof createCoreActions>
) => {
  const addPreset = (raw: Partial<PresetType>) => {
    try {
      // スキーマでバリデーションしつつデフォルト値を適用
      const newPreset = PresetSchema.parse({
        ...raw,
        key: raw.key || raw.id || `preset_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const newPresets = {
        ...state.data.value.presets,
        [newPreset.id]: newPreset,
      }
      coreActions.setData({ presets: newPresets })

      // 追加したプリセットを選択状態にする
      state.selectedPresetId.value = newPreset.id

      ConsolePost('info', `プリセット「${newPreset.name}」を追加しました`)
      state.hasChanged.value = true
      return newPreset
    } catch (error) {
      const errorMessage = `プリセットの追加に失敗しました: ${error}`
      ConsolePost('error', errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updatePreset = (presetId: string, updates: Partial<PresetType>) => {
    try {
      const original = state.data.value.presets[presetId]
      if (!original) {
        throw new Error(`プリセット（ID: ${presetId}）が見つかりません`)
      }

      const updated: PresetType = {
        ...original,
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      // スキーマでバリデーション
      const validatedPreset = PresetSchema.parse(updated)

      const newPresets = {
        ...state.data.value.presets,
        [presetId]: validatedPreset,
      }
      coreActions.setData({ presets: newPresets })
      ConsolePost('info', `プリセット「${validatedPreset.name}」を更新しました`)
      state.hasChanged.value = true
    } catch (error) {
      const errorMessage = `プリセットの更新に失敗しました: ${error}`
      ConsolePost('error', errorMessage)
      throw new Error(errorMessage)
    }
  }

  const removePreset = (presetId: string) => {
    try {
      const presetToRemove = state.data.value.presets[presetId]
      if (!presetToRemove) {
        throw new Error(`プリセット（ID: ${presetId}）が見つかりません`)
      }

      const { [presetId]: _, ...rest } = state.data.value.presets
      coreActions.setData({ presets: rest })

      // アクティブなプリセットが削除された場合はクリア
      if (state.data.value.target === presetId) {
        coreActions.setData({ target: '' })
      }

      // 選択中のプリセットが削除された場合はクリア
      if (state.selectedPresetId.value === presetId) {
        state.selectedPresetId.value = null
      }

      ConsolePost('info', `プリセット「${presetToRemove.name}」を削除しました`)
      state.hasChanged.value = true
    } catch (error) {
      const errorMessage = `プリセットの削除に失敗しました: ${error}`
      ConsolePost('error', errorMessage)
      throw new Error(errorMessage)
    }
  }

  const duplicatePreset = (presetId: string) => {
    try {
      const originalPreset = state.data.value.presets[presetId]
      if (!originalPreset) {
        throw new Error(`プリセット（ID: ${presetId}）が見つかりません`)
      }

      const duplicatedPreset = {
        ...originalPreset,
        id: `${presetId}_copy_${Date.now()}`,
        name: `${originalPreset.name} のコピー`,
        key: `${originalPreset.key}_copy_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const newPreset = addPreset(duplicatedPreset)
      ConsolePost('info', `プリセット「${originalPreset.name}」を複製しました`)
      state.hasChanged.value = true
      return newPreset
    } catch (error) {
      const errorMessage = `プリセットの複製に失敗しました: ${error}`
      ConsolePost('error', errorMessage)
      throw new Error(errorMessage)
    }
  }

  const setActivePreset = (presetId: string) => {
    try {
      const preset = state.data.value.presets[presetId]
      if (!preset) {
        throw new Error(`指定されたプリセット（ID: ${presetId}）が見つかりません`)
      }

      coreActions.setData({ target: presetId })
      ConsolePost('info', `アクティブプリセットを「${preset.name}」に設定しました`)
      state.hasChanged.value = true
    } catch (error) {
      const errorMessage = `アクティブプリセットの設定に失敗しました: ${error}`
      ConsolePost('error', errorMessage)
      throw new Error(errorMessage)
    }
  }

  const clearActivePreset = () => {
    coreActions.setData({ target: '' })
    ConsolePost('info', 'アクティブプリセットをクリアしました')
    state.hasChanged.value = true
  }

  const validatePreset = (preset: Partial<PresetType>): string[] => {
    const errors: string[] = []

    // 名前の検証
    if (!preset.name || preset.name.trim().length === 0) {
      errors.push('プリセット名は必須です')
    }

    if (preset.name && preset.name.trim().length > 50) {
      errors.push('プリセット名は50文字以内で入力してください')
    }

    // 重複チェック
    if (preset.name && preset.id) {
      const duplicates = Object.values(state.data.value.presets).find(
        (p) => p.name.trim() === preset.name!.trim() && p.id !== preset.id
      )
      if (duplicates) {
        errors.push('同じ名前のプリセットが既に存在します')
      }
    }

    // 説明の長さチェック
    if (preset.description && preset.description.length > 200) {
      errors.push('説明は200文字以内で入力してください')
    }

    // threshold の基本検証
    if (preset.threshold && !preset.threshold.conditions) {
      errors.push('発火条件が正しく設定されていません')
    }

    return errors
  }

  // プリセットの並び替え機能
  const reorderPresets = (presetIds: string[]) => {
    try {
      const currentPresets = state.data.value.presets
      const reorderedPresets: Record<string, PresetType> = {}

      // 指定された順序で再構築
      presetIds.forEach((id) => {
        if (currentPresets[id]) {
          reorderedPresets[id] = currentPresets[id]
        }
      })

      coreActions.setData({ presets: reorderedPresets })
      ConsolePost('info', 'プリセットの並び順を更新しました')
      state.hasChanged.value = true
    } catch (error) {
      const errorMessage = `プリセットの並び替えに失敗しました: ${error}`
      ConsolePost('error', errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    addPreset,
    updatePreset,
    removePreset,
    duplicatePreset,
    setActivePreset,
    clearActivePreset,
    validatePreset,
    reorderPresets,
  }
}
