// src\MainPlugin\store\ElectronStoreManager.ts
import ElectronStore from 'electron-store'
import { DataSchema, PresetType, type DataSchemaType } from '../../types/type'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'

export class ElectronStoreManager {
  private static instance: ElectronStoreManager | null = null

  private constructor(private readonly electronStore: ElectronStore<DataSchemaType>) {}

  static init(electronStore: ElectronStore): ElectronStoreManager {
    const storeData = electronStore.store as DataSchemaType
    if (!storeData) {
      const errorMsg = 'ストアデータが見つからないか、形式が不正です。'
      ConsolePost('error', errorMsg)
      throw new Error(errorMsg)
    }

    // ! ダブルキャスト
    const typedStore = electronStore as unknown as ElectronStore<DataSchemaType>
    this.instance = new ElectronStoreManager(typedStore)
    return this.instance
  }

  static getInstance(): ElectronStoreManager {
    if (!this.instance) {
      throw new Error('ElectronStoreManager is not initialized')
    }
    return this.instance
  }

  // ElectronStore 本体に直接アクセス
  getStore(): ElectronStore<DataSchemaType> {
    return this.electronStore
  }

  // 最新の storeData を常に返す
  getData(): DataSchemaType {
    const raw = this.electronStore.get('store')
    // バリデーションして型保証
    return DataSchema.parse(raw)
  }

  // 現在の target に基づいて preset を返す
  currentPreset(): PresetType | null {
    const data = this.getData()
    const key = data.target
    if (!key) return null

    const preset = data.presets[key]
    if (!preset || !preset.threshold) return null

    return preset
  }
}
