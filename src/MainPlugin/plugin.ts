// src/MainPlugin/plugin.ts (Pinia統合版)
import { SETTINGS } from '@/types/settings'
import { DataSchema } from '@/types/type'
import { handlePostRequest } from './services/postHandler'
import { handleGetRequest } from './services/getHandler'
import { checkAllConditions } from '@shared/utils/threshold/ThresholdChecker'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'
import { OnePlugin, PluginResponse, PluginRequest, Comment } from '@onecomme.com/onesdk/'
import { ElectronStoreManager } from './store/ElectronStoreManager'

const plugin: OnePlugin = {
  name: 'コメントカッタープラグイン CommentCutter',
  uid: SETTINGS.PLUGIN_UID,
  version: '0.0.1',
  author: 'Pintocuru',
  url: '',
  permissions: ['filter.comment'],

  defaultState: DataSchema.parse({}),

  async init(api, initialData) {
    try {
      // init 内で一度だけ初期化
      ElectronStoreManager.init(api.store)

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
      // コメントテスターであれば必ずcommentを返す
      if (comment.id === 'COMMENT_TESTER') return comment

      const esm = ElectronStoreManager.getInstance()
      const currentPreset = esm.currentPreset()
      if (!currentPreset) return comment

      const { threshold, isBlacklist, isFilterSpeech } = currentPreset

      // 条件がなければスルー
      if (!threshold || threshold.conditions.length === 0) return comment

      const isMatched = checkAllConditions(comment, threshold)
      console.info(threshold, `test:${isMatched ? '弾かれたよ' : '通ったよ'}`)

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

      const esm = ElectronStoreManager.getInstance()
      const store = esm.getStore()

      if (method === 'POST') {
        return await handlePostRequest(body, pathSegments, store, req.params)
      } else if (method === 'GET') {
        return await handleGetRequest(pathSegments, req.params, store)
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
    ConsolePost('info', '【コメントカッタープラグイン】がOFFだよ')
  },
}

export default plugin
