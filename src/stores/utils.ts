// src\stores\utils.ts
import { createState } from './state'

export const createUtils = (state: ReturnType<typeof createState>, getters: any) => {
  const getDebugInfo = () => ({
    data: state.data.value,
    isInitialized: state.isInitialized.value,
    selectedPresetId: state.selectedPresetId.value,
    currentPreset: getters.currentPreset.value,
  })

  return { getDebugInfo }
}
