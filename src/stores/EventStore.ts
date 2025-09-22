// src/store/EventStore.ts
// 軽量なEventEmitterベースのストア実装

import { DataSchema, DataSchemaType, PresetType } from '@/types/type'

// ========================
// Store Factory Function
// ========================

export function createEventStore(): EventStore {
  return new EventStore()
}

// シングルトンインスタンス（必要に応じて使用）
let globalStore: EventStore | null = null

export function getGlobalStore(): EventStore {
  if (!globalStore) {
    globalStore = new EventStore()
  }
  return globalStore
}

export function resetGlobalStore(): void {
  globalStore = null
}

type StoreEventMap = {
  'data:changed': (data: DataSchemaType) => void
  'preset:added': (preset: PresetType) => void
  'preset:updated': (presetId: string, preset: PresetType) => void
  'preset:removed': (presetId: string) => void
  'active:changed': (presetId: string | null) => void
  'error:occurred': (error: string) => void
}

type EventListener<T extends keyof StoreEventMap> = StoreEventMap[T]

export class EventStore {
  private data: DataSchemaType
  private listeners: Map<keyof StoreEventMap, Set<Function>> = new Map()
  private electronStore: any = null
  private storeKey: string = 'pluginData'
  private isInitialized: boolean = false
  private isDirty: boolean = false
  private lastError: string | null = null
  private isEditorMode: boolean = false

  constructor() {
    this.data = DataSchema.parse({})
    this.initializeEventMap()
  }

  private initializeEventMap() {
    // すべてのイベントタイプのMapを初期化
    const eventTypes: (keyof StoreEventMap)[] = [
      'data:changed',
      'preset:added',
      'preset:updated',
      'preset:removed',
      'active:changed',
      'error:occurred',
    ]

    eventTypes.forEach((type) => {
      this.listeners.set(type, new Set())
    })
  }

  // ========================
  // Event System
  // ========================

  on<T extends keyof StoreEventMap>(event: T, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.add(listener as Function)
    }
  }

  off<T extends keyof StoreEventMap>(event: T, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(listener as Function)
    }
  }

  private emit<T extends keyof StoreEventMap>(event: T, ...args: Parameters<StoreEventMap[T]>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`Event listener error for ${event}:`, error)
        }
      })
    }
  }

  // ========================
  // Core Store Methods
  // ========================

  initialize(
    initialData?: Partial<DataSchemaType>,
    editorMode = false,
    apiStore?: any,
    storageKey = 'pluginData'
  ): void {
    try {
      if (initialData) {
        this.data = DataSchema.parse(initialData)
      }

      this.isInitialized = true
      this.isEditorMode = editorMode
      this.isDirty = false
      this.lastError = null

      if (apiStore) {
        this.electronStore = apiStore
        this.storeKey = storageKey
      }

      this.emit('data:changed', this.data)
    } catch (error) {
      this.lastError = '初期化に失敗しました'
      this.emit('error:occurred', this.lastError)
      throw error
    }
  }

  getData(): DataSchemaType {
    return { ...this.data }
  }

  updateData(newData: DataSchemaType): void {
    try {
      const validatedData = DataSchema.parse(newData)
      const oldData = this.data

      this.data = validatedData
      this.isDirty = true
      this.lastError = null

      this.emit('data:changed', this.data)

      if (!this.isEditorMode) {
        console.log('Store data updated:', { oldData, newData: this.data })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
      this.lastError = `データの更新に失敗しました: ${errorMessage}`
      this.emit('error:occurred', this.lastError)
      throw error
    }
  }

  updateDataPartial(updates: Partial<DataSchemaType>): void {
    try {
      const newData = { ...this.data, ...updates }
      this.updateData(newData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
      this.lastError = `データの部分更新に失敗しました: ${errorMessage}`
      this.emit('error:occurred', this.lastError)
      throw error
    }
  }

  reset(): void {
    try {
      const defaultData = DataSchema.parse({})
      this.data = defaultData
      this.isDirty = true
      this.lastError = null

      this.emit('data:changed', this.data)
      console.log('Store data reset to default')
    } catch (error) {
      this.lastError = 'データのリセットに失敗しました'
      this.emit('error:occurred', this.lastError)
      throw error
    }
  }

  // ========================
  // Preset Management
  // ========================

  addPreset(preset: Omit<PresetType, 'id'> & { id?: string }): PresetType {
    try {
      const newPreset: PresetType = {
        ...preset,
        id: preset.id || `preset_${Date.now()}`,
        createdAt: preset.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const newPresets = [...this.data.presets, newPreset]
      this.updateDataPartial({ presets: newPresets })

      this.emit('preset:added', newPreset)
      return newPreset
    } catch (error) {
      this.lastError = 'プリセットの追加に失敗しました'
      this.emit('error:occurred', this.lastError)
      throw error
    }
  }

  updatePreset(presetId: string, updates: Partial<PresetType>): void {
    try {
      const presetIndex = this.data.presets.findIndex((p) => p.id === presetId)
      if (presetIndex === -1) {
        throw new Error('プリセットが見つかりません')
      }

      const updatedPreset = {
        ...this.data.presets[presetIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      const newPresets = [...this.data.presets]
      newPresets[presetIndex] = updatedPreset

      this.updateDataPartial({ presets: newPresets })
      this.emit('preset:updated', presetId, updatedPreset)
    } catch (error) {
      this.lastError = 'プリセットの更新に失敗しました'
      this.emit('error:occurred', this.lastError)
      throw error
    }
  }

  removePreset(presetId: string): void {
    try {
      const newPresets = this.data.presets.filter((preset) => preset.id !== presetId)
      this.updateDataPartial({ presets: newPresets })

      if (this.data.target === presetId) {
        this.updateDataPartial({ target: '' })
        this.emit('active:changed', null)
      }

      this.emit('preset:removed', presetId)
    } catch (error) {
      this.lastError = 'プリセットの削除に失敗しました'
      this.emit('error:occurred', this.lastError)
      throw error
    }
  }

  duplicatePreset(presetId: string): PresetType {
    try {
      const originalPreset = this.data.presets.find((p) => p.id === presetId)
      if (!originalPreset) {
        throw new Error('プリセットが見つかりません')
      }

      const duplicatedPreset = {
        ...originalPreset,
        id: `${presetId}_copy_${Date.now()}`,
        name: `${originalPreset.name} のコピー`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return this.addPreset(duplicatedPreset)
    } catch (error) {
      this.lastError = 'プリセットの複製に失敗しました'
      this.emit('error:occurred', this.lastError)
      throw error
    }
  }

  setActivePreset(presetId: string): void {
    try {
      const preset = this.data.presets.find((p) => p.id === presetId)
      if (!preset) {
        throw new Error('指定されたプリセットが見つかりません')
      }

      this.updateDataPartial({ target: presetId })
      this.emit('active:changed', presetId)
    } catch (error) {
      this.lastError = 'アクティブプリセットの設定に失敗しました'
      this.emit('error:occurred', this.lastError)
      throw error
    }
  }

  clearActivePreset(): void {
    this.updateDataPartial({ target: '' })
    this.emit('active:changed', null)
  }

  // ========================
  // Getters
  // ========================

  getCurrentPreset(): PresetType | null {
    if (!this.data.target) return null
    return this.data.presets.find((preset) => preset.id === this.data.target) || null
  }

  getAllPresets(): PresetType[] {
    return [...this.data.presets]
  }

  getPresetById(id: string): PresetType | null {
    return this.data.presets.find((preset) => preset.id === id) || null
  }

  hasPresets(): boolean {
    return this.data.presets.length > 0
  }

  hasActivePreset(): boolean {
    return !!this.data.target && this.getCurrentPreset() !== null
  }

  getPresetsOptions(): { value: string; label: string; description: string }[] {
    return this.data.presets.map((preset) => ({
      value: preset.id,
      label: preset.name || preset.id,
      description: preset.description || '',
    }))
  }

  // ========================
  // Persistence
  // ========================

  async autoSave(): Promise<void> {
    if (!this.isDirty || !this.electronStore) return

    try {
      this.electronStore.set(this.storeKey, this.data)
      this.isDirty = false
      console.log('Data auto-saved successfully')
    } catch (error) {
      this.lastError = '自動保存に失敗しました'
      this.emit('error:occurred', this.lastError)
      throw error
    }
  }

  async save(): Promise<void> {
    if (!this.electronStore) {
      throw new Error('ストレージが設定されていません')
    }

    try {
      this.electronStore.set(this.storeKey, this.data)
      this.isDirty = false
      console.log('Data saved successfully')
    } catch (error) {
      this.lastError = '保存に失敗しました'
      this.emit('error:occurred', this.lastError)
      throw error
    }
  }

  // ========================
  // Status Methods
  // ========================

  getIsInitialized(): boolean {
    return this.isInitialized
  }

  getIsDirty(): boolean {
    return this.isDirty
  }

  getLastError(): string | null {
    return this.lastError
  }

  clearError(): void {
    this.lastError = null
  }

  getIsEditorMode(): boolean {
    return this.isEditorMode
  }

  // ========================
  // Cleanup
  // ========================

  async destroy(): Promise<void> {
    try {
      // 未保存の変更があれば保存
      if (this.isDirty) {
        await this.autoSave()
      }

      // リスナーをクリアアップ
      this.listeners.forEach((listenerSet) => listenerSet.clear())
      this.listeners.clear()

      // 状態をリセット
      this.reset()
      this.electronStore = null
      this.storeKey = 'pluginData'
      this.isInitialized = false

      console.log('Store destroyed and cleaned up')
    } catch (error) {
      console.error('Store destroy error:', error)
      throw error
    }
  }

  // ========================
  // Validation
  // ========================

  validatePreset(preset: Partial<PresetType>): string[] {
    const errors: string[] = []

    if (!preset.name || preset.name.trim().length === 0) {
      errors.push('プリセット名は必須です')
    }

    if (preset.name && preset.name.trim().length > 50) {
      errors.push('プリセット名は50文字以内で入力してください')
    }

    if (preset.name && preset.id) {
      const duplicate = this.data.presets.find((p) => p.name === preset.name && p.id !== preset.id)
      if (duplicate) {
        errors.push('同じ名前のプリセットが既に存在します')
      }
    }

    return errors
  }
}
