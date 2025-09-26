// C:\_root\_nodejs\OmikenTemplates\templates\CommentCutter\src\MainPlugin\services\postHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'
import { SETTINGS } from '@/types/settings'
import { DataSchema, DataSchemaType } from '@/types/type'
import { handleSaveData } from './posts/saveHandler'
import { handlePresetOperation } from './posts/presetHandler'
import { handleTargetUpdate } from './posts/targetHandler'
import ElectronStore from 'electron-store'

export async function handlePostRequest(
  body: any,
  pathSegments: string[],
  store: ElectronStore<DataSchemaType>
): Promise<PluginResponse> {
  try {
    // bodyのバリデーション
    if (!body) {
      return {
        code: 400,
        response: JSON.stringify({ error: 'Request body is required' }),
      }
    }

    // Zodでバリデーション
    const validationResult = DataSchema.safeParse(body)
    if (!validationResult.success) {
      postSystemMessage('データフォーマットエラーが発生しました', SETTINGS.botName)

      return {
        code: 400,
        response: JSON.stringify({
          error: 'Invalid data format',
          details: validationResult.error.issues,
        }),
      }
    }

    const validatedData: DataSchemaType = validationResult.data

    // パスによって処理を分岐
    const action = pathSegments[0] || 'save'

    switch (action) {
      case 'save':
      case 'update':
        return await handleSaveData(store, validatedData)

      case 'preset':
        return await handlePresetOperation(store, validatedData, pathSegments)

      case 'target':
        return await handleTargetUpdate(store, validatedData)

      default:
        return {
          code: 404,
          response: JSON.stringify({ error: `Unknown action: ${action}` }),
        }
    }
  } catch (error) {
    console.error('POST handling error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    postSystemMessage(`保存中にエラーが発生しました: ${errorMessage}`, SETTINGS.botName)

    return {
      code: 500,
      response: JSON.stringify({ error: 'Failed to save data', details: errorMessage }),
    }
  }
}
