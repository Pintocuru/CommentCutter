// src\MainPlugin\services\getHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { useCommentCutterStore } from '@/stores/pluginStore'
import { SETTINGS } from '@/types/settings'

export async function handleGetRequest(
  pathSegments: string[],
  params: { [key: string]: string },
  pluginPinia: any
): Promise<PluginResponse> {
  try {
    // ストアを取得
    const store = useCommentCutterStore(pluginPinia)

    if (!store.isInitialized) {
      return {
        code: 503,
        response: JSON.stringify({ error: 'Store is not initialized' }),
      }
    }

    // パスによって処理を分岐
    const resource = pathSegments[0] || 'data'

    switch (resource) {
      case 'data':
        return handleGetData(store)

      case 'presets':
        return handleGetPresets(store, pathSegments[1])

      case 'preset':
        return handleGetSpecificPreset(store, pathSegments[1] || params.id)

      case 'target':
        return handleGetTarget(store)

      case 'status':
        return handleGetStatus(store)

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
function handleGetData(store: ReturnType<typeof useCommentCutterStore>): PluginResponse {
  return {
    code: 200,
    response: JSON.stringify({
      success: true,
      data: store.data,
    }),
  }
}

// プリセット一覧取得
function handleGetPresets(store: ReturnType<typeof useCommentCutterStore>, filter?: string): PluginResponse {
  let presets = store.allPresets

  // フィルター適用
  if (filter === 'active' && store.hasActivePreset) {
    presets = store.currentPreset ? [store.currentPreset] : []
  }

  return {
    code: 200,
    response: JSON.stringify({
      success: true,
      presets: presets,
      count: presets.length,
    }),
  }
}

// 特定のプリセット取得
function handleGetSpecificPreset(store: ReturnType<typeof useCommentCutterStore>, presetId?: string): PluginResponse {
  if (!presetId) {
    return {
      code: 400,
      response: JSON.stringify({ error: 'Preset ID is required' }),
    }
  }

  const preset = store.allPresets.find((p) => p.id === presetId)

  if (!preset) {
    return {
      code: 404,
      response: JSON.stringify({ error: 'Preset not found' }),
    }
  }

  return {
    code: 200,
    response: JSON.stringify({
      success: true,
      preset: preset,
    }),
  }
}

// アクティブターゲット取得
function handleGetTarget(store: ReturnType<typeof useCommentCutterStore>): PluginResponse {
  return {
    code: 200,
    response: JSON.stringify({
      success: true,
      target: store.data.target,
      hasActivePreset: store.hasActivePreset,
      currentPreset: store.currentPreset,
    }),
  }
}

// ステータス取得
function handleGetStatus(store: ReturnType<typeof useCommentCutterStore>): PluginResponse {
  return {
    code: 200,
    response: JSON.stringify({
      success: true,
      status: {
        isInitialized: store.isInitialized,
        hasPresets: store.hasPresets,
        hasActivePreset: store.hasActivePreset,
        presetsCount: store.allPresets.length,
        target: store.data.target,
      },
    }),
  }
}
