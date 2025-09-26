// src/configMaker/composables/useConfigApi.ts
import { useCommentCutterStore } from '../../stores/pluginStore'
import type { DataSchemaType } from '../../types/type'
import { SETTINGS } from '@/types/settings'
import OneSDK from '@onecomme.com/onesdk'

// APIモード定義
enum Mode {
  AllData = 'allData',
  // 他のモードを必要に応じて追加
}

// APIクライアント
class ApiClient {
  private static readonly baseUrl = `${SETTINGS.baseUrl}/plugins/${SETTINGS.PLUGIN_UID}`

  static async request(params: { method: string; mode: Mode; type?: string }, data?: object): Promise<string> {
    const config = {
      headers: { 'Content-Type': 'application/json' },
      data: data || {},
    }

    const url = `${this.baseUrl}?mode=${params.mode}&type=${params.type || ''}`

    try {
      const response = params.method === 'GET' 
        ? await OneSDK.get(url, {}) 
        : await OneSDK.post(url, config)

      this.validateResponse(response, params.type)
      return response.data.response
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  private static validateResponse(response: any, type: string = ''): void {
    if (!response.data || response.data.code !== 200) {
      throw new Error(`API request failed: ${response.data?.message || 'Unknown error'}`)
    }
  }
}

export const useConfigApi = () => {
  const store = useCommentCutterStore()

  // データフェッチ関数
  const fetchAppEditorData = async (): Promise<any> => {
    try {
      const response = await ApiClient.request({ method: 'GET', mode: Mode.AllData })
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

    async saveConfig(data: DataSchemaType): Promise<void> {
      console.log('Saving config to mock API...', data)
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
  }

  // 設定の初期化
  const initializeConfig = async () => {
    try {
      let config: DataSchemaType
      
      // 環境に応じてAPIを切り替え
      if (process.env.NODE_ENV === 'development') {
        config = await mockEditorApi.loadConfig()
      } else {
        // 本番環境では実際のAPIを使用
        const data = await fetchAppEditorData()
        config = {
          target: '',
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

  // 設定の保存
  const saveConfig = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        await mockEditorApi.saveConfig(store.data)
      } else {
        // 本番環境での保存処理を実装
        // await ApiClient.request({ method: 'POST', mode: Mode.SaveData }, store.data)
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