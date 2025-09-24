// src/stores/commentCutter/getters.ts
import { computed } from 'vue'
import type { StoreState } from './types'
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

    // 同様の修正
    let actualThreshold = preset.threshold

    if (actualThreshold && typeof actualThreshold === 'object' && !Array.isArray(actualThreshold)) {
      /**
 * 型 'string' の式を使用して型 '{ conditions: ("comment" | "access" | "gift" | "count" | "userId" | "username")[]; comment?: string[] | undefined; access?: ("basic" | "member" | "subscriber" | "premium" | "moderator" | "owner")[] | undefined; gift?: ("all" | ... 8 more ... | "special")[] | undefined; count?: { ...; } | undefined; userId?: string[]...' にインデックスを付けることはできないため、要素は暗黙的に 'any' 型になります。
  型 'string' のパラメーターを持つインデックス シグネチャが型 '{ conditions: ("comment" | "access" | "gift" | "count" | "userId" | "username")[]; comment?: string[] | undefined; access?: ("basic" | "member" | "subscriber" | "premium" | "moderator" | "owner")[] | undefined; gift?: ("all" | ... 8 more ... | "special")[] | undefined; count?: { ...; } | undefined; userId?: string[]...' に見つかりませんでした。ts(7053)
let actualThreshold: {
    conditions: ("comment" | "access" | "gift" | "count" | "userId" | "username")[];
    comment?: string[] | undefined;
    access?: ("basic" | "member" | "subscriber" | "premium" | "moderator" | "owner")[] | undefined;
    gift?: ("all" | "blue" | "lightBlue" | "green" | "yellow" | "orange" | "pink" | "red" | "purple" | "special")[] | undefined;
    count?: {
        comparison: "lowerBound" | "upperBound" | "equal" | "loop";
        unit: "lc" | "tc";
        value: number;
    } | undefined;
    userId?: string[] | undefined;
    username?: string[] | undefined;
}
 */
      if (!actualThreshold.conditions && actualThreshold[key]) {
        actualThreshold = actualThreshold[key]
      }
    }

    return {
      ...preset,
      threshold: actualThreshold,
    }
  }),

  allPresets: computed(() => Object.values(state.data.value.presets)),

  hasPresets: computed(() => Object.keys(state.data.value.presets).length > 0),

  // 💡 hasActivePreset の改善
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
