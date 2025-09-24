// src/MainPlugin/services/handlers/presetHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'
import { SETTINGS } from '@/types/settings'
import { DataSchemaType } from '@/types/type'
import { useCommentCutterStore } from '@/stores/pluginStore'

export async function handlePresetOperation(
  store: ReturnType<typeof useCommentCutterStore>,
  data: DataSchemaType,
  pathSegments: string[]
): Promise<PluginResponse> {
  const operation = pathSegments[1] // preset/add, preset/update, preset/delete

  try {
    switch (operation) {
      case 'add':
      case 'update':
        return await handlePresetAddOrUpdate(store, data, operation)

      case 'delete':
        return await handlePresetDelete(store, data)

      default:
        return {
          code: 400,
          response: JSON.stringify({ error: `Unknown preset operation: ${operation}` }),
        }
    }
  } catch (error) {
    console.error('Preset operation error:', error)
    throw error
  }
}

async function handlePresetAddOrUpdate(
  store: ReturnType<typeof useCommentCutterStore>,
  data: DataSchemaType,
  operation: 'add' | 'update'
): Promise<PluginResponse> {
  // data.presets が Record に変更されたため、キーの存在を確認
  const presetKeys = Object.keys(data.presets || {})
  if (presetKeys.length === 0) {
    throw new Error('No preset data provided')
  }

  // 最初のプリセットを取得（どのキーが渡されるか不明なため、最初のキーを使用）
  const presetId = presetKeys[0]
  const updatedPreset = data.presets[presetId]

  if (!updatedPreset) {
    throw new Error('No preset data provided or invalid preset key')
  }

  if (operation === 'add') {
    store.addPreset(updatedPreset)
    postSystemMessage(`プリセット「${updatedPreset.name}」を追加しました`, SETTINGS.botName)
  } else {
    store.updatePreset(updatedPreset.id, updatedPreset)
    postSystemMessage(`プリセット「${updatedPreset.name}」を更新しました`, SETTINGS.botName)
  }

  await store.save()

  return {
    code: operation === 'add' ? 201 : 200,
    response: JSON.stringify({
      success: true,
      message: `Preset ${operation} successfully`,
      preset: updatedPreset,
    }),
  }
}

async function handlePresetDelete(
  store: ReturnType<typeof useCommentCutterStore>,
  data: DataSchemaType
): Promise<PluginResponse> {
  if (!data.target) {
    throw new Error('No preset ID provided')
  }

  store.removePreset(data.target)
  await store.save()

  postSystemMessage(`プリセットを削除しました`, SETTINGS.botName)

  return {
    code: 200,
    response: JSON.stringify({
      success: true,
      message: 'Preset deleted successfully',
    }),
  }
}
