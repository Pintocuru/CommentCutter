// src\MainPlugin\services\posts\saveHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'
import { SETTINGS } from '@/types/settings'
import { DataSchemaType } from '@/types/type'
import ElectronStore from 'electron-store'

export async function handleSaveData(
  electronStore: ElectronStore<DataSchemaType>,
  data: DataSchemaType
): Promise<PluginResponse> {
  try {
    // ストアのデータを更新
    electronStore.store = data
    postSystemMessage('データが正常に保存されました', SETTINGS.botName)

    return {
      code: 200,
      response: JSON.stringify({
        success: true,
        message: 'Data saved successfully',
        data: electronStore.store,
      }),
    }
  } catch (error) {
    console.error('Save data error:', error)
    throw error
  }
}
