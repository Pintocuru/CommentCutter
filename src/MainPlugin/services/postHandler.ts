// src\MainPlugin\services\postHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'
import { SETTINGS } from '@/types/settings'
import { DataSchema, DataSchemaType } from '@/types/type'
import { handleSaveData } from './posts/saveHandler'
import { createErrorResponse } from './utils/responseHelpers'
import ElectronStore from 'electron-store'

export async function handlePostRequest(
  electronStore: ElectronStore<DataSchemaType>,
  params: Record<string, string>,
  body: any
): Promise<PluginResponse> {
  try {
    // bodyとdataの存在チェック
    if (!body?.data) {
      return createErrorResponse(400, 'Request body and data are required')
    }

    // JSONパースとバリデーション
    const parsedData = parseAndValidateData(body.data)
    if (!parsedData.success) {
      return parsedData.response
    }

    // アクション実行
    const action = params.type || 'save'
    return action === 'save'
      ? await handleSaveData(electronStore, parsedData.data)
      : createErrorResponse(404, `Unknown action: ${action}`)
  } catch (error) {
    console.error('POST handling error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    postSystemMessage(`保存中にエラーが発生しました: ${errorMessage}`, { username: SETTINGS.botName })
    return createErrorResponse(500, 'Failed to save data', errorMessage)
  }
}

// ヘルパー関数：データパースとバリデーション
function parseAndValidateData(
  data: string
): { success: true; data: DataSchemaType } | { success: false; response: PluginResponse } {
  try {
    const parsedData = JSON.parse(data)

    const validationResult = DataSchema.safeParse(parsedData)
    if (!validationResult.success) {
      postSystemMessage('データフォーマットエラーが発生しました', { username: SETTINGS.botName })

      return {
        success: false,
        response: createErrorResponse(400, 'Invalid data format', validationResult.error.issues),
      }
    }

    return { success: true, data: validationResult.data }
  } catch (parseError) {
    return {
      success: false,
      response: createErrorResponse(400, 'Invalid JSON in request body'),
    }
  }
}
