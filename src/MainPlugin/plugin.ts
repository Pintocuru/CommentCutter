// src/MainPlugin/plugin.ts (Pinia統合版)
import { SETTINGS } from '@/types/settings'
import { DataSchema, DataSchemaType, PresetType } from '@/types/type'
import { handlePostRequest } from './handlers/postHandler'
import { handleGetRequest } from './handlers/getHandler'
import { useCommentCutterStore } from '@/stores/pluginStore'
import { checkAllConditions } from '@shared/utils/threshold/ThresholdChecker'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'
import { createPinia } from 'pinia'
import { OnePlugin, PluginResponse, PluginRequest, PluginAPI } from '@onecomme.com/onesdk/'

// プラグイン専用のPiniaインスタンス
const pluginPinia = createPinia()

const plugin: OnePlugin = {
  name: 'コメントカッタープラグイン CommentCutter',
  uid: SETTINGS.PLUGIN_UID,
  version: '0.0.1',
  author: 'Pintocuru',
  url: '',
  permissions: ['filter.comment'],

  defaultState: DataSchema.parse({}),

  async init(api: PluginAPI, initialData) {
    try {
      // ストアを初期化（プラグインモード）
      const store = useCommentCutterStore(pluginPinia)
      const storeData = api.store.store as DataSchemaType

      // Check if the data exists before proceeding
      if (!storeData || !storeData.target) {
        const errorMsg = 'ストアデータが見つからないか、形式が不正です。'
        ConsolePost('error', errorMsg, SETTINGS.botName)
        throw new Error(errorMsg)
      }

      // api.storeの参照を渡して初期化
      store.initialize(storeData, false, api.store, 'pluginData')

      // プラグインの起動メッセージ
      ConsolePost('info', `【コメントカッタープラグイン】がONだよ`)
    } catch (error) {
      console.error('Plugin initialization failed:', error)
      ConsolePost('error', `プラグインの初期化に失敗しました: ${error}`, SETTINGS.botName)
      throw error
    }
  },

  async filterComment(comment, service, userData) {
    try {
      const store = useCommentCutterStore(pluginPinia)

      // TODO:コメントテスターであれば必ずtrue(commentを返す)
      if (!store.isInitialized || !store.hasActivePreset) {
        ConsolePost('error', `初期化されてないよ`)
        return comment
      }

      const threshold = store.currentPreset?.threshold
      if (!threshold) return comment

      // マッチしたらfalse
      const isMatched = checkAllConditions(comment, threshold)
      if (isMatched) {
        console.info(threshold, `test:弾かれたよ`)
      } else {
        console.info(threshold, `test:通ったよ`)
      }

      return isMatched ? false : comment
    } catch (error) {
      console.error('Filter comment error:', error)
      ConsolePost('error', `フィルタリングエラー: ${error}`, SETTINGS.botName)
      return comment
    }
  },

  async request(req: PluginRequest): Promise<PluginResponse> {
    try {
      const { method, url, body } = req
      const pathSegments = url.split('/').filter((segment) => segment !== '' && segment !== 'api')

      if (method === 'POST') {
        return await handlePostRequest(body, pathSegments, pluginPinia)
      } else if (method === 'GET') {
        return await handleGetRequest(pathSegments, req.params, pluginPinia)
      }

      return {
        code: 405,
        response: JSON.stringify({ error: 'Method Not Allowed' }),
      }
    } catch (error) {
      console.error('Request handling error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      ConsolePost('error', `エラーが発生しました: ${errorMessage}`, SETTINGS.botName)

      return {
        code: 500,
        response: JSON.stringify({ error: 'Internal Server Error', details: errorMessage }),
      }
    }
  },

  destroy() {
    try {
      const store = useCommentCutterStore(pluginPinia)
      // destroyメソッドで最終保存とクリーンアップ
      store.destroy()
      ConsolePost('info', '【コメントカッタープラグイン】がOFFだよ')
    } catch (error) {
      ConsolePost('error', 'Plugin destroy error:', error)
    }
  },
}

export default plugin
