// src\MainPlugin\services\utils\responseHelpers.ts
import { PluginResponse } from '@onecomme.com/onesdk/'

/**
 * エラーレスポンスを作成
 */
export function createErrorResponse(code: number, error: string, details?: string | any[]): PluginResponse {
  return {
    code,
    response: JSON.stringify({
      error,
      ...(details && { details }),
    }),
  }
}

/**
 * 成功レスポンスを作成
 */
export function createSuccessResponse<T = any>(data: T, code: number = 200): PluginResponse {
  return {
    code,
    response: JSON.stringify({
      success: true,
      data,
    }),
  }
}
