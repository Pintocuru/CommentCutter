// src/stores/pluginStore.ts
import { readonly } from 'vue'
import { defineStore } from 'pinia'
import { createState } from './state'
import { createGetters } from './getters'
import { createCoreActions } from './actions/core'
import { createPresetActions } from './actions/presets'
import { createEditorActions } from './actions/editor'
import { createPersistenceActions } from './actions/persistence'
import { createUtils } from './utils'

export const useCommentCutterStore = defineStore('commentCutter', () => {
  const state = createState()
  const getters = createGetters(state)

  const coreActions = createCoreActions(state)
  const presetActions = createPresetActions(state, coreActions)
  const editorActions = createEditorActions(state)
  const persistenceActions = createPersistenceActions(state)
  const utils = createUtils(state, getters)

  // destroy処理は複数のアクションを組み合わせる必要があるため、ここで定義
  const destroy = async () => {
    try {
      await persistenceActions.autoSave()
      coreActions.reset()
      state.electronStore.value = null
      state.storeKey.value = 'pluginData'
      console.log('Store destroyed and cleaned up')
    } catch (error) {
      console.error('Store destroy error:', error)
    }
  }

  return {
    // State (readonly)
    data: readonly(state.data),
    isInitialized: readonly(state.isInitialized),
    selectedPresetId: readonly(state.selectedPresetId),

    // Getters
    ...getters,

    // Actions
    ...coreActions,
    ...presetActions,
    ...editorActions,
    ...persistenceActions,
    ...utils,
    destroy,
  }
})
