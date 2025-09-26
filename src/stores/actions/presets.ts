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
        key: raw.key || raw.id || `${Date.now()}`,
        name: raw.name || `プリセット${Object.keys(state.data.value.presets).length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const newPresets = {
        ...state.data.value.presets,
        [newPreset.key]: newPreset,
      }
      coreActions.setData({ presets: newPresets })

      // 追加したプリセットを選択状態にする
      state.selectedPresetId.value = newPreset.key

      ConsolePost('info', `プリセット「${newPreset.name}」を追加しました`)
      state.hasChanged.value = true
      return newPreset
    } catch (error) {
      const errorMessage = `プリセットの追加に失敗しました: ${error}`
      ConsolePost('error', errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updatePreset = (key: string, updates: Partial<PresetType>) => {
    try {
      const original = state.data.value.presets[key]
      if (!original) {
        throw new Error(`プリセット（ID: ${key}）が見つかりません`)
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
        [key]: validatedPreset,
      }
      coreActions.setData({ presets: newPresets })
      state.hasChanged.value = true
    } catch (error) {
      const errorMessage = `プリセットの更新に失敗しました: ${error}`
      ConsolePost('error', errorMessage)
      throw new Error(errorMessage)
    }
  }

  const removePreset = (key: string) => {
    try {
      const presetToRemove = state.data.value.presets[key]
      if (!presetToRemove) {
        throw new Error(`プリセット（ID: ${key}）が見つかりません`)
      }

      const { [key]: _, ...rest } = state.data.value.presets
      coreActions.setData({ presets: rest })

      // アクティブなプリセットが削除された場合はクリア
      if (state.data.value.target === key) {
        coreActions.setData({ target: '' })
      }

      // 選択中のプリセットが削除された場合はクリア
      if (state.selectedPresetId.value === key) {
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

  const duplicatePreset = (key: string) => {
    try {
      const originalPreset = state.data.value.presets[key]
      if (!originalPreset) {
        throw new Error(`プリセット（ID: ${key}）が見つかりません`)
      }

      const duplicatedPreset = {
        ...originalPreset,
        id: `${key}_copy_${Date.now()}`,
        key: `${originalPreset.key}_copy_${Date.now()}`,
        name: `${originalPreset.name} のコピー`,
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

  const setActivePreset = (key: string) => {
    try {
      const preset = state.data.value.presets[key]
      if (!preset) {
        throw new Error(`指定されたプリセット（ID: ${key}）が見つかりません`)
      }

      coreActions.setData({ target: key })
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

    // threshold の基本検証
    if (preset.threshold && !preset.threshold.conditions) {
      errors.push('発動条件が正しく設定されていません')
    }

    return errors
  }

  // プリセットの並び替え機能
  const reorderPresets = (presetKeys: string[]) => {
    try {
      const currentPresets = state.data.value.presets
      const reorderedPresets: Record<string, PresetType> = {}

      // 指定された順序で再構築
      presetKeys.forEach((key) => {
        if (currentPresets[key]) {
          reorderedPresets[key] = currentPresets[key]
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
