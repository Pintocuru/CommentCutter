// src/configMaker/composables/useConfigApi.ts
import { toRaw } from 'vue'
import { isDev, isRealApi, SETTINGS } from '@/types/settings'
import type { DataSchemaType } from '@/types/type'
import { useCommentCutterStore } from '@/stores/pluginStore'
import { OneSdkApiClient } from '@/api/OneSdkApiClient'
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'

export const useConfigApi = () => {
  const store = useCommentCutterStore()
  const ApiClient = new OneSdkApiClient(SETTINGS.PLUGIN_UID)

  // 設定の初期化
  const initializeConfig = async () => {
    try {
      let config: DataSchemaType

      // 環境に応じてAPIを切り替え
      if (isDev && !isRealApi) {
        config = await mockEditorApi.loadConfig()
      } else {
        // 本番環境では実際のAPIを使用
        const data = await fetchAppEditorData()
        config = data
      }

      store.initialize(config)
    } catch (error) {
      store.failInit()
      console.error('Failed to initialize config:', error)
      throw error
    }
  }

  // データフェッチ関数
  const fetchAppEditorData = async (): Promise<DataSchemaType> => {
    try {
      const data = await ApiClient.get('data')
      return data
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
        target: 'demo_preset',
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
      console.log(store.data)

      if (isDev && !isRealApi) {
        // 開発環境なら告知のみ
        await mockEditorApi.saveConfig(store.data)
      } else {
        const payload = toRaw(store.data)
        await ApiClient.post('save', payload)
      }
      console.log('Config saved successfully')
    } catch (error) {
      postSystemMessage(`保存中にエラーが発生しました: ${error}`)
      // エラーが発生した場合でも hasChanged は false にして無限ループを防ぐ
      store.markAsSaved()
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
