// src\api\OneSdkApiClient.ts
import { api } from '@shared/http/client'
import type { AxiosResponse } from 'axios'

export interface ApiClient {
  get: (resource: string) => Promise<any>
  post: (resource: string, data: any) => Promise<any>
}

// プラグイン用のOneSDK API実装
export class OneSdkApiClient implements ApiClient {
  private baseUrl: string

  constructor(pluginUid: string) {
    this.baseUrl = `/plugins/${pluginUid}`
  }

  async get(resource: string = 'data'): Promise<any> {
    const url = `${this.baseUrl}?mode=get&type=${encodeURIComponent(resource)}`

    try {
      const response = await api.get(url)
      this.validateResponse(response)

      const responseData = JSON.parse(response.data.response)
      if (resource === 'data') return responseData.data || {}

      return responseData
    } catch (error) {
      console.error(`API GET request failed for resource: ${resource}`, error)
      throw new Error(`Failed to fetch ${resource}: ${error}`)
    }
  }

  async post(resource: string = 'save', data: any): Promise<any> {
    const url = `${this.baseUrl}?mode=post&type=${encodeURIComponent(resource)}`

    try {
      const response = await api.post(url, data)
      this.validateResponse(response)

      const responseData = JSON.parse(response.data.response)
      return responseData
    } catch (error) {
      console.error(`API POST request failed for resource: ${resource}`, error)
      throw new Error(`Failed to save ${resource}: ${error}`)
    }
  }

  private validateResponse(response: AxiosResponse): void {
    if (response.data?.code === 200) return

    // サーバーは { code, response: '{"error": "...", "details": ...}' } 形式で返す
    let detail: unknown = response.data?.code ?? 'no response'
    try {
      detail = JSON.parse(response.data?.response)?.error ?? detail
    } catch {
      // response が JSON でなければ code をそのまま使う
    }
    throw new Error(`API request failed: ${detail}`)
  }
}
