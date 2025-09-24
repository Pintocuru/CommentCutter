// src/MainPlugin/plugin.ts (Pinia統合版)
import { SETTINGS } from '@/types/settings'
import { DataSchema, DataSchemaType } from '@/types/type'
import { handlePostRequest } from './services/postHandler'
import { handleGetRequest } from './services/getHandler'
import { useCommentCutterStore } from '@/stores/pluginStore'
import { checkAllConditions } from '@shared/utils/threshold/ThresholdChecker'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'
import { createPinia } from 'pinia'
import { OnePlugin, PluginResponse, PluginRequest, PluginAPI, Comment } from '@onecomme.com/onesdk/'

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
        ConsolePost('error', errorMsg)
        throw new Error(errorMsg)
      }

      // api.storeの参照を渡して初期化
      store.initialize(storeData, api.store, 'pluginData')

      // プラグインの起動メッセージ
      ConsolePost('info', `【コメントカッタープラグイン】がONだよ`)
    } catch (error) {
      console.error('Plugin initialization failed:', error)
      ConsolePost('error', `プラグインの初期化に失敗しました: ${error}`)
      throw error
    }
  },

  async filterComment(comment, service, userData) {
    try {
      const store = useCommentCutterStore(pluginPinia)

      // コメントテスターであれば必ずcommentを返す
      if (comment.id === 'COMMENT_TESTER') return comment

      if (!store.isInitialized || !store.hasActivePreset) {
        ConsolePost('error', `初期化されてないよ`)
        return comment
      }

      // 条件がなければスルー
      const threshold = store.currentPreset?.threshold
      if (!threshold || threshold.conditions.length === 0) {
        return comment
      }

      const isMatched = checkAllConditions(comment, threshold)
      console.info(threshold, `test:${isMatched ? '弾かれたよ' : '通ったよ'}`)

      const { isBlacklist, isFilterSpeech } = store.currentPreset ?? {}

      // スピーチ部分だけ消す処理をまとめる
      const clearSpeech = (): Comment => {
        comment.data.speechText = ''
        return comment
      }

      // ブラックリスト方式
      if (isBlacklist) {
        if (isFilterSpeech && isMatched) return clearSpeech()
        return isMatched ? false : comment
      }

      // ホワイトリスト方式
      if (isFilterSpeech && !isMatched) return clearSpeech()
      return isMatched ? comment : false
    } catch (error) {
      console.error('Filter comment error:', error)
      ConsolePost('error', `フィルタリングエラー: ${error}`)
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

      ConsolePost('error', `エラーが発生しました: ${errorMessage}`)

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
