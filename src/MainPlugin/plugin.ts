// src/MainPlugin/plugin.ts (Pinia統合版)
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'
import { OnePlugin, PluginResponse, PluginRequest, PluginAPI } from '@onecomme.com/onesdk/'
import { handlePostRequest } from './handlers/postHandler'
import { handleGetRequest } from './handlers/getHandler'
import { DataSchema } from '@/types/type'
import { SETTINGS } from '@/types/settings'
import { useCommentCutterStore } from '@/stores/pluginStore'
import { createPinia } from 'pinia'
import { checkAllConditions } from '@shared/utils/threshold/ThresholdChecker'

// プラグイン専用のPiniaインスタンス
const pluginPinia = createPinia()

const plugin: OnePlugin = {
  name: 'コメントカッタープラグイン CommentCutter',
  uid: SETTINGS.PLUGIN_UID,
  version: '0.0.1',
  author: 'Pintocuru',
  url: '',
  permissions: ['comments'],

  defaultState: DataSchema.parse({}),

  async init(api: PluginAPI, initialData) {
    try {
      // ストアを初期化（プラグインモード）
      const store = useCommentCutterStore(pluginPinia)
      const storeData = api.store.get('pluginData', this.defaultState)

      // api.storeの参照を渡して初期化
      store.initialize(storeData, false, api.store, 'pluginData')

      console.log('Plugin initialized with Pinia store')
    } catch (error) {
      console.error('Plugin initialization failed:', error)
      postSystemMessage(`プラグインの初期化に失敗しました: ${error}`, SETTINGS.botName)
      throw error
    }
  },

  async filterComment(comment, service, userData) {
    try {
      const store = useCommentCutterStore(pluginPinia)

      if (!store.isInitialized || !store.hasActivePreset) {
        return comment
      }

      const threshold = store.currentPreset?.threshold
      if (!threshold) return comment

      // マッチしたらfalse
      const isMatched = checkAllConditions(comment, threshold)

      return isMatched ? false : comment
    } catch (error) {
      console.error('Filter comment error:', error)
      postSystemMessage(`フィルタリングエラー: ${error}`, SETTINGS.botName)
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

      postSystemMessage(`エラーが発生しました: ${errorMessage}`, SETTINGS.botName)

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
      console.log('Plugin destroyed and Pinia store cleaned up')
    } catch (error) {
      console.error('Plugin destroy error:', error)
    }
  },
}

export default plugin
