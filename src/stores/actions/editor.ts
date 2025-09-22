// src/stores/commentCutter/actions/editor.ts
import { createState } from '../state'

export const createEditorActions = (state: ReturnType<typeof createState>) => {
  const setEditorMode = (mode: boolean) => {
    state.isEditorMode.value = mode
  }

  const selectPreset = (presetId: string | null) => {
    state.selectedPresetId.value = presetId
  }

  const openPresetDialog = () => {
    state.isPresetDialogOpen.value = true
  }

  const closePresetDialog = () => {
    state.isPresetDialogOpen.value = false
    state.selectedPresetId.value = null
  }

  return {
    setEditorMode,
    selectPreset,
    openPresetDialog,
    closePresetDialog,
  }
}
