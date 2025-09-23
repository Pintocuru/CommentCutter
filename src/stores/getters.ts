// src/stores/commentCutter/getters.ts
import { computed } from 'vue'
import type { StoreState } from './types'
import { createState } from './state'

export const createGetters = (state: ReturnType<typeof createState>) => ({
  currentPreset: computed(() => {
    const key = state.data.value.target
    return key ? (state.data.value.presets[key] ?? null) : null
  }),

  selectedPreset: computed(() => {
    const key = state.selectedPresetId.value
    return key ? (state.data.value.presets[key] ?? null) : null
  }),

  allPresets: computed(() => Object.values(state.data.value.presets)),

  hasPresets: computed(() => Object.keys(state.data.value.presets).length > 0),

  hasActivePreset: computed(() => !!state.data.value.target),

  presetsOptions: computed(() =>
    Object.values(state.data.value.presets).map((preset) => ({
      value: preset.id,
      label: preset.name || preset.id,
      description: preset.description || '',
    }))
  ),
})
