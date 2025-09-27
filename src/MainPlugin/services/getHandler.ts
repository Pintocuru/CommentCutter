// src\MainPlugin\services\getHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { DataSchemaType } from '@/types/type'
import { createErrorResponse, createSuccessResponse } from './utils/responseHelpers'
import ElectronStore from 'electron-store'

export async function handleGetRequest(
  electronStore: ElectronStore<DataSchemaType>,
  params: Record<string, string>
): Promise<PluginResponse> {
  try {
    const resource = params.type || 'data'
    const storeData = electronStore.store

    const handlers: Record<string, () => PluginResponse> = {
      data: () => handleGetData(storeData),
      target: () => handleGetTarget(storeData),
    }

    return handlers[resource]?.() || createErrorResponse(404, `Unknown resource: ${resource}`)
  } catch (error) {
    console.error('GET handling error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResponse(500, 'Failed to retrieve data', errorMessage)
  }
}

// 全データ取得
function handleGetData(data: DataSchemaType): PluginResponse {
  return createSuccessResponse(data)
}

// アクティブターゲット取得
function handleGetTarget(data: DataSchemaType): PluginResponse {
  const targetKey = data.target

  if (!targetKey) {
    return createSuccessResponse(null)
  }

  const preset = data.presets[targetKey]
  const targetData = preset?.threshold ? preset : null

  return createSuccessResponse(targetData)
}
