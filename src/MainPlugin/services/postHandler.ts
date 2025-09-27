// src\MainPlugin\services\postHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'
import { SETTINGS } from '@/types/settings'
import { DataSchema, DataSchemaType } from '@/types/type'
import { handleSaveData } from './posts/saveHandler'
import ElectronStore from 'electron-store'

export async function handlePostRequest(
  body: any,
  pathSegments: string[],
  store: ElectronStore<DataSchemaType>,
  params: Record<string, string>
): Promise<PluginResponse> {
  try {
    // bodyのバリデーション
    if (!body || !body.data) {
      return {
        code: 400,
        response: JSON.stringify({ error: 'Request body and data are required' }),
      }
    }

    // 🔥 修正：body.data（JSON文字列）をパースしてからバリデーション
    let parsedData
    try {
      parsedData = JSON.parse(body.data)
    } catch (parseError) {
      return {
        code: 400,
        response: JSON.stringify({ error: 'Invalid JSON in request body' }),
      }
    }

    console.info('解析後のデータ:', parsedData)

    // Zodでバリデーション（解析後のデータに対して）
    const validationResult = DataSchema.safeParse(parsedData)
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
    const action = params.type || 'save'

    switch (action) {
      case 'save':
        return await handleSaveData(store, validatedData)

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
