import { createState } from './state'

// src/stores/commentCutter/utils.ts
export const createUtils = (state: ReturnType<typeof createState>, getters: any) => {
  const getDebugInfo = () => ({
    data: state.data.value,
    isInitialized: state.isInitialized.value,
    isEditorMode: state.isEditorMode.value,
    isDirty: state.isDirty.value,
    selectedPresetId: state.selectedPresetId.value,
    currentPreset: getters.currentPreset.value,
  })

  return { getDebugInfo }
}
