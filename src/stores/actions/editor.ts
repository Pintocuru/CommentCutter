// src\stores\actions\editor.ts
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
    } catch (error) {
      const errorMessage = `プリセット選択に失敗しました: ${error}`
      ConsolePost('error', errorMessage)
      throw new Error(errorMessage)
    }
  }

  // エディターの状態管理
  const editorState = {
    // エディターのUIテーマを管理
    setTheme: (theme: 'light' | 'dark') => {
      state.data.value.theme = theme
      state.hasChanged.value = true
    },
  }

  return {
    selectPreset,
    editorState,
  }
}
