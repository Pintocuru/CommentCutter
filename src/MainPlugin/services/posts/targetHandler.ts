// src/MainPlugin/services/handlers/targetHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'
import { SETTINGS } from '@/types/settings'
import { DataSchemaType } from '@/types/type'
import { useCommentCutterStore } from '@/stores/pluginStore'

export async function handleTargetUpdate(
  store: ReturnType<typeof useCommentCutterStore>,
  data: DataSchemaType
): Promise<PluginResponse> {
  try {
    if (!data.target) {
      return {
        code: 400,
        response: JSON.stringify({ error: 'Target preset ID is required' }),
      }
    }

    store.setActivePreset(data.target)
    await store.save()

    postSystemMessage(`アクティブプリセットを変更しました`, SETTINGS.botName)

    return {
      code: 200,
      response: JSON.stringify({
        success: true,
        message: 'Target preset updated successfully',
        target: data.target,
      }),
    }
  } catch (error) {
    console.error('Target update error:', error)
    throw error
  }
}
