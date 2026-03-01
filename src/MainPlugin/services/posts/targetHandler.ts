// src\MainPlugin\services\posts\targetHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'
import { SETTINGS } from '@/types/settings'
import { DataSchemaType } from '@/types/type'
import ElectronStore from 'electron-store'

export async function handleTargetUpdate(
  store: ElectronStore<DataSchemaType>,
  data: DataSchemaType
): Promise<PluginResponse> {
  try {
    if (!data.target) {
      return {
        code: 400,
        response: JSON.stringify({ error: 'Target preset ID is required' }),
      }
    }

    store.set('target', data.target)

    postSystemMessage(`アクティブプリセットを変更しました`, { username: SETTINGS.botName })

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
