// src/MainPlugin/services/handlers/saveHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'
import { SETTINGS } from '@/types/settings'
import { DataSchemaType } from '@/types/type'
import { useCommentCutterStore } from '@/stores/pluginStore'

export async function handleSaveData(
  store: ReturnType<typeof useCommentCutterStore>,
  data: DataSchemaType
): Promise<PluginResponse> {
  try {
    // ストアのデータを更新
    store.updateData(data)

    // 永続化
    await store.save()

    postSystemMessage('データが正常に保存されました', SETTINGS.botName)

    return {
      code: 200,
      response: JSON.stringify({
        success: true,
        message: 'Data saved successfully',
        data: store.data,
      }),
    }
  } catch (error) {
    console.error('Save data error:', error)
    throw error
  }
}
