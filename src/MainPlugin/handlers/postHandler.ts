// src/handlers/postHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { PackageMetaSchema, PackageMetaType } from '@shared/types'
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'
import { SETTINGS } from '@/Modules/settings'
import { saveDataToFile } from '../utils/fileUtils'

export async function handlePostRequest(body: any, pathSegments: string[]): Promise<PluginResponse> {
  try {
    // bodyからmetaデータを検証
    if (!body || !body.meta) {
      return {
        code: 400,
        response: JSON.stringify({ error: 'Missing meta data in request body' }),
      }
    }

    // Zodでバリデーション
    const validationResult = PackageMetaSchema.safeParse(body.meta)
    if (!validationResult.success) {
      postSystemMessage('バリデーションエラーが発生しました', SETTINGS.botName)

      return {
        code: 400,
        response: JSON.stringify({
          error: 'Invalid meta data format',
          details: validationResult.error.issues,
        }),
      }
    }

    const meta: PackageMetaType = validationResult.data

    // データを保存
    const filePath = await saveDataToFile(meta, body)

    // 成功メッセージをコメントテスターに送信
    postSystemMessage(`データが正常に保存されました: ${meta.generatorName}/${meta.name}`, SETTINGS.botName)

    return {
      code: 200,
      response: JSON.stringify({
        success: true,
        message: 'Data saved successfully',
        path: filePath,
        meta: meta,
      }),
    }
  } catch (error) {
    console.error('POST handling error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await postSystemMessage(`保存中にエラーが発生しました: ${errorMessage}`, SETTINGS.botName)

    return {
      code: 500,
      response: JSON.stringify({ error: 'Failed to save data', details: errorMessage }),
    }
  }
}
