// src/stores/commentCutter/getters.ts
import { computed } from 'vue'
import type { StoreState } from './types'
import { createState } from './state'

export const createGetters = (state: ReturnType<typeof createState>) => ({
  currentPreset: computed(() => {
    if (!state.data.value.target) return null
    return state.data.value.presets.find((preset) => preset.id === state.data.value.target) || null
  }),

  selectedPreset: computed(() => {
    if (!state.selectedPresetId.value) return null
    return state.data.value.presets.find((preset) => preset.id === state.selectedPresetId.value) || null
  }),

  allPresets: computed(() => state.data.value.presets),

  hasPresets: computed(() => state.data.value.presets.length > 0),

  hasActivePreset: computed(() => !!state.data.value.target),

  presetsOptions: computed(() =>
    state.data.value.presets.map((preset) => ({
      value: preset.id,
      label: preset.name || preset.id,
      description: preset.description || '',
    }))
  ),
})
