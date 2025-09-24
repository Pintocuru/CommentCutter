// src/stores/commentCutter/actions/editor.ts
import { createState } from '../state'

export const createEditorActions = (state: ReturnType<typeof createState>) => {
  const selectPreset = (presetId: string | null) => {
    state.selectedPresetId.value = presetId
  }

  return {
    selectPreset,
  }
}
