// src/MainPlugin/plugin.ts
import { SETTINGS } from '@/types/settings'
import { DataSchema } from '@/types/type'
import { handlePostRequest } from './services/postHandler'
import { handleGetRequest } from './services/getHandler'
import { ElectronStoreManager } from './store/ElectronStoreManager'
import { createErrorResponse } from './services/utils/responseHelpers'
import { handleFilterComment } from './scripts/filterLogic/filterLogic'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'
import { OnePlugin, PluginResponse, PluginRequest } from '@onecomme.com/onesdk/'

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
      // ! ElectronStore<Record<string, unknown>> -> ElectronStore<DataSchemaType> にするため any
      ElectronStoreManager.init(api.store as any)

      // プラグインの起動メッセージ
      ConsolePost('info', `【コメントカッタープラグイン】がONだよ`)
    } catch (error) {
      console.error('Plugin initialization failed:', error)
      ConsolePost('error', `プラグインの初期化に失敗しました: ${error}`)
      throw error
    }
  },

  async filterComment(comment, service, userData) {
    return handleFilterComment(comment)
  },

  async request(req: PluginRequest): Promise<PluginResponse> {
    try {
      const { method, params, body } = req
      const store = ElectronStoreManager.getInstance().getStore()

      const handlers: Record<string, () => Promise<PluginResponse> | PluginResponse> = {
        POST: () => handlePostRequest(store, params, body),
        GET: () => handleGetRequest(store, params),
      }

      return await (handlers[method]?.() || createErrorResponse(405, 'Method Not Allowed'))
    } catch (error) {
      console.error('Request handling error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      ConsolePost('error', `エラーが発生しました: ${errorMessage}`)
      return createErrorResponse(500, 'Internal Server Error', errorMessage)
    }
  },

  destroy() {
    ConsolePost('info', '【コメントカッタープラグイン】がOFFだよ')
  },
}

export default plugin
