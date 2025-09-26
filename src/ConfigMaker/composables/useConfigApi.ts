// src/configMaker/composables/useConfigApi.ts
import { useCommentCutterStore } from '@/stores/pluginStore'
import type { DataSchemaType } from '@/types/type'
import { OneSdkApiClient } from '@/api/OneSdkApiClient'
import { isDev, SETTINGS } from '@/types/settings'

export const useConfigApi = () => {
  const store = useCommentCutterStore()
  const ApiClient = new OneSdkApiClient(SETTINGS.PLUGIN_UID)

  // 設定の初期化
  const initializeConfig = async () => {
    try {
      let config: DataSchemaType

      // 環境に応じてAPIを切り替え
      if (isDev) {
        config = await mockEditorApi.loadConfig()
      } else {
        // 本番環境では実際のAPIを使用
        const data = await fetchAppEditorData()
        config = {
          target: '',
          theme: 'dark',
          presets: data.Presets || {},
        }
      }

      store.initialize(config)
      console.log('Config initialized successfully')
    } catch (error) {
      console.error('Failed to initialize config:', error)
      throw error
    }
  }

  // データフェッチ関数
  const fetchAppEditorData = async (): Promise<any> => {
    try {
      const response = await ApiClient.get('data')
      const data = JSON.parse(response)
      return {
        Presets: data.Presets,
      }
    } catch (error) {
      console.error('Failed to fetch app editor data:', error)
      throw error
    }
  }

  // エディター用API（開発・テスト用）
  const mockEditorApi = {
    async loadConfig(): Promise<DataSchemaType> {
      console.log('Loading config from mock API...')
      // デモデータを返す
      return {
        target: '',
        theme: 'dark',
        presets: {
          demo_preset: {
            id: 'demo_preset',
            key: 'demo_preset',
            name: 'デモプリセット',
            description: 'これはデモ用のプリセットです',
            isBlacklist: true,
            isFilterSpeech: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            threshold: {
              conditions: ['comment'],
              comment: ['おみくじ'],
            },
          },
        },
      }
    },

    async saveConfig(data: any): Promise<void> {
      console.log('Saving config to mock API...', data)
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
  }

  // 設定の保存
  const saveConfig = async () => {
    try {
      if (isDev) {
        // 開発環境なら告知のみ
        await mockEditorApi.saveConfig(store.data)
      } else {
        // 本番環境での保存処理を実装
        await ApiClient.post('save', store.data)
      }
      console.log('Config saved successfully')
    } catch (error) {
      console.error('Failed to save config:', error)
      throw error
    }
  }

  return {
    initializeConfig,
    saveConfig,
    fetchAppEditorData,
  }
}
