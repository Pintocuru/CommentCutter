// src/stores/commentCutter/actions/editor.ts
import { createState } from '../state'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'

export const createEditorActions = (state: ReturnType<typeof createState>) => {
  const selectPreset = (presetId: string | null) => {
    try {
      if (presetId === null) {
        state.selectedPresetId.value = null
        ConsolePost('info', 'プリセット選択をクリアしました')
        return
      }

      const preset = state.data.value.presets[presetId]
      if (!preset) {
        throw new Error(`プリセット（ID: ${presetId}）が見つかりません`)
      }

      state.selectedPresetId.value = presetId
      ConsolePost('info', `プリセット「${preset.name}」を選択しました`)
    } catch (error) {
      const errorMessage = `プリセット選択に失敗しました: ${error}`
      ConsolePost('error', errorMessage)
      throw new Error(errorMessage)
    }
  }

  // エディターの状態管理
  const editorState = {
    // エディターのUIテーマを管理
    setTheme: (theme: 'light' | 'dark' | 'auto') => {
      // 実装は必要に応じて
      ConsolePost('info', `エディターテーマを${theme}に設定しました`)
    },

    // エディターの表示モードを管理
    setViewMode: (mode: 'simple' | 'advanced') => {
      // 実装は必要に応じて
      ConsolePost('info', `エディター表示モードを${mode}に設定しました`)
    },

    // フィルター設定など
    setFilter: (filter: string) => {
      // 実装は必要に応じて
      ConsolePost('info', `エディターフィルターを設定しました: ${filter}`)
    },
  }

  // プリセット編集の履歴管理（将来の機能拡張用）
  const history = {
    undo: () => {
      // 実装は必要に応じて
      ConsolePost('info', 'Undo機能は未実装です')
    },

    redo: () => {
      // 実装は必要に応じて
      ConsolePost('info', 'Redo機能は未実装です')
    },

    canUndo: () => false,
    canRedo: () => false,
  }

  return {
    selectPreset,
    editorState,
    history,
  }
}
