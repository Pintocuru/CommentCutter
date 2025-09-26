// src\stores\pluginStore.ts
import { readonly, ref } from 'vue'
import { defineStore } from 'pinia'
import { createState } from './state'
import { createGetters } from './getters'
import { createCoreActions } from './actions/pluginCore'
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

  return {
    // State (readonly)
    data: readonly(state.data),
    hasChanged: state.hasChanged,
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
  }
})
