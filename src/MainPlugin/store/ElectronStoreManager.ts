// src\MainPlugin\store\ElectronStoreManager.ts
import ElectronStore from 'electron-store'
import { DataSchema, PresetType, type DataSchemaType } from '../../types/type'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'

export class ElectronStoreManager {
  private static instance: ElectronStoreManager | null = null

  private constructor(private readonly electronStore: ElectronStore<DataSchemaType>) {}

  static init(electronStore: ElectronStore<DataSchemaType>): ElectronStoreManager {
    this.instance = new ElectronStoreManager(electronStore)
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
    // ストア全体を取得
    let raw = this.electronStore.store

    // raw が undefined の場合 (ストアが空の場合) に備え、安全策として {} を適用
    if (raw === undefined || Object.keys(raw).length === 0) {
      // Zodのデフォルト値で初期データを生成
      const defaultData = DataSchema.parse({})

      // 永続化: .store を直接上書きする (Electron Storeの仕様による)
      this.electronStore.store = defaultData

      raw = defaultData
      ConsolePost('info', `[ESM Init] Store was empty. Zod defaults saved.`)
    }

    // 有効なオブジェクトをパース
    return DataSchema.parse(raw)
  }

  // 現在の target に基づいて preset を返す
  currentPreset(): PresetType | null {
    const data = this.getData()
    const key = data.target
    if (!key || key === '') return null

    const preset = data.presets[key]
    if (!preset || !preset.threshold) return null

    return preset
  }
}
