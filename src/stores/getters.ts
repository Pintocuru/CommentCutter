// src\stores\getters.ts
import { computed } from 'vue'
import { createState } from './state'

export const createGetters = (state: ReturnType<typeof createState>) => ({
  currentPreset: computed(() => {
    const key = state.data.value.target
    if (!key) return null

    const preset = state.data.value.presets[key]
    // 💡 より安全なチェック
    if (!preset || !preset.threshold) return null

    return preset
  }),

  selectedPreset: computed(() => {
    const key = state.selectedPresetId.value
    if (!key) return null

    const preset = state.data.value.presets[key]
    if (!preset) return null

    return preset
  }),
  // プリセットを配列にしたもの（必要かな？）
  allPresets: computed(() => Object.values(state.data.value.presets)),
  // 設定の数
  hasPresets: computed(() => Object.keys(state.data.value.presets).length > 0),

  // ？
  hasActivePreset: computed(() => {
    const target = state.data.value.target
    return !!(target && state.data.value.presets[target])
  }),

  presetsOptions: computed(() =>
    Object.values(state.data.value.presets).map((preset) => ({
      value: preset.id,
      label: preset.name || preset.id,
      description: preset.description || '',
    }))
  ),
})
