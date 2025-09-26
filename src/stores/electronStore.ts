// src\stores\electronStore.ts
import { defineStore } from 'pinia'
import { createState } from './state'
import { createCoreActions } from './actions/pluginCore'
import ElectronStore from 'electron-store'

export const createElectronStore = (electronStore: ElectronStore) =>
  defineStore('pluginStore', () => {
    const state = createState()
    state.electronStore.value = electronStore

    const pluginCoreActions = createCoreActions(state)

    return {
      ...pluginCoreActions,
    }
  })
