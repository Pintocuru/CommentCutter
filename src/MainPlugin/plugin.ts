// src\MainPlugin\plugin.ts
import { SETTINGS } from '@/Modules/settings'
import { defaultState } from '@/Modules/defaultState'
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'
import { OnePlugin, PluginResponse, PluginRequest } from '@onecomme.com/onesdk/'
import { handlePostRequest } from './handlers/postHandler'
import { handleGetRequest } from './handlers/getHandler'
import { initializeDataDirectory } from './utils/fileUtils'

const plugin: OnePlugin = {
  name: 'コメントカッタープラグイン CommentCutter', // プラグイン名
  uid: SETTINGS.PLUGIN_UID, // プラグイン固有の一意のID
  version: '0.0.1', // プラグインのバージョン番号
  author: 'Pintocuru', // 開発者名
  url: '', // サポートページのURL
  permissions: ['comments'],

  // プラグインの初期状態
  defaultState: defaultState,

  // プラグインの初期化
  async init() {
    await initializeDataDirectory()
  },

  // filterComment:コメントを加工・変更する
  async filterComment(comment, service, userData) {
    // 対象となるフィルタリングの値
    /**
     * comment: 'チャットワード',
     *  access: 'ユーザーの役職',
     * gift: 'ギフト',
     *  count: 'チャット数',
     * service: '配信プラットフォーム',
     * userId: 'ユーザーID',
     * username: 'ユーザー名',
     */

    // 自身のプラグインの投稿（botの投稿）はおみくじを行わない

    return false
  },

  // Rest APIを使った送受信
  async request(req: PluginRequest): Promise<PluginResponse> {
    try {
      const { method, url, body } = req

      // URLからパスを抽出（例: /api/package -> package）
      const pathSegments = url.split('/').filter((segment) => segment !== '' && segment !== 'api')

      if (method === 'POST') {
        return await handlePostRequest(body, pathSegments)
      } else if (method === 'GET') {
        return await handleGetRequest(pathSegments, req.params)
      }

      return {
        code: 405,
        response: JSON.stringify({ error: 'Method Not Allowed' }),
      }
    } catch (error) {
      console.error('Request handling error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // コメントテスターでエラーをコメントさせる
      postSystemMessage(`エラーが発生しました: ${errorMessage}`, SETTINGS.botName)

      return {
        code: 500,
        response: JSON.stringify({ error: 'Internal Server Error', details: errorMessage }),
      }
    }
  },
}

export default plugin

export class hoge {
  constructor() {}
}
