// src\MainPlugin\services\getHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { DataSchemaType } from '@/types/type'
import ElectronStore from 'electron-store'

export async function handleGetRequest(
  pathSegments: string[],
  params: Record<string, string>,
  store: ElectronStore<DataSchemaType>
): Promise<PluginResponse> {
  try {
    // パスによって処理を分岐
    const storeData = store.get('store') as DataSchemaType
    const resource = pathSegments[0] || 'data'

    switch (resource) {
      case 'data':
        return handleGetData(storeData)

      case 'target':
        return handleGetTarget(storeData)

      default:
        return {
          code: 404,
          response: JSON.stringify({ error: `Unknown resource: ${resource}` }),
        }
    }
  } catch (error) {
    console.error('GET handling error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return {
      code: 500,
      response: JSON.stringify({ error: 'Failed to retrieve data', details: errorMessage }),
    }
  }
}

// 全データ取得
function handleGetData(data: DataSchemaType): PluginResponse {
  return {
    code: 200,
    response: JSON.stringify({
      success: true,
      data,
    }),
  }
}

// アクティブターゲット取得
function handleGetTarget(data: DataSchemaType): PluginResponse {
  const targetKey = data.target

  // 有効なターゲットキーがない場合
  if (!targetKey || targetKey === '') {
    return {
      code: 200,
      response: JSON.stringify({
        success: true,
        data: null,
      }),
    }
  }

  const preset = data.presets[targetKey]

  // プリセットが存在しない、または閾値が設定されていない場合
  if (!preset || !preset.threshold) {
    return {
      code: 200,
      response: JSON.stringify({
        success: true,
        data: null,
      }),
    }
  }

  return {
    code: 200,
    response: JSON.stringify({
      success: true,
      data: preset,
    }),
  }
}
