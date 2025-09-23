// src/handlers/postHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { postSystemMessage } from '@shared/sdk/postMessage/PostOneComme'
import { SETTINGS } from '@/types/settings'
import { DataSchema, DataSchemaType } from '@/types/type'
import { useCommentCutterStore } from '@/stores/pluginStore'

export async function handlePostRequest(body: any, pathSegments: string[], pluginPinia: any): Promise<PluginResponse> {
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

    // ストアを取得
    const store = useCommentCutterStore(pluginPinia)

    if (!store.isInitialized) {
      return {
        code: 503,
        response: JSON.stringify({ error: 'Store is not initialized' }),
      }
    }

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

// データ保存処理
async function handleSaveData(
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

// プリセット操作処理
async function handlePresetOperation(
  store: ReturnType<typeof useCommentCutterStore>,
  data: DataSchemaType,
  pathSegments: string[]
): Promise<PluginResponse> {
  const operation = pathSegments[1] // preset/add, preset/update, preset/delete

  try {
    switch (operation) {
      case 'add':
      case 'update': {
        // data.presets が Record に変更されたため、キーの存在を確認
        const presetKeys = Object.keys(data.presets || {})
        if (presetKeys.length > 0) {
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
            // operation === 'update'
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
        throw new Error('No preset data provided')
      }

      case 'delete':
        if (data.target) {
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
        throw new Error('No preset ID provided')

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

// ターゲット更新処理
async function handleTargetUpdate(
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
