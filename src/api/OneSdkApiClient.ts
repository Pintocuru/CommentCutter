// src\api\OneSdkApiClient.ts
import OneSDK from '@onecomme.com/onesdk'
import type { AxiosResponse } from 'axios'

export interface ApiClient {
  get: (resource: string) => Promise<any>
  post: (resource: string, data: any) => Promise<any>
}

// プラグイン用のOneSDK API実装
export class OneSdkApiClient implements ApiClient {
  private baseUrl: string

  constructor(pluginUid: string) {
    this.baseUrl = `http://localhost:11180/api/plugins/${pluginUid}`
  }

  async get(resource: string = 'data'): Promise<any> {
    const url = `${this.baseUrl}?mode=get&type=${resource}`

    try {
      const response: AxiosResponse = await OneSDK.get(url, {})

      this.validateResponse(response)

      // レスポンスの構造に合わせて解析
      const responseData = JSON.parse(response.data.response)

      if (resource === 'data') {
        return responseData.data || {}
      }

      return responseData
    } catch (error) {
      console.error(`API GET request failed for resource: ${resource}`, error)
      throw new Error(`Failed to fetch ${resource}: ${error}`)
    }
  }

  async post(resource: string = 'save', data: any): Promise<any> {
    const url = `${this.baseUrl}?mode=post&type=${resource}`

    const config = {
      headers: { 'Content-Type': 'application/json' },
      data: data,
    }

    try {
      const response: AxiosResponse = await OneSDK.post(url, config)

      this.validateResponse(response)

      // レスポンスの構造に合わせて解析
      const responseData = JSON.parse(response.data.response)
      return responseData
    } catch (error) {
      console.error(`API POST request failed for resource: ${resource}`, error)
      throw new Error(`Failed to save ${resource}: ${error}`)
    }
  }

  private validateResponse(response: AxiosResponse): void {
    if (!response.data || response.data.code !== 200) {
      throw new Error(`API request failed: ${response.data?.message || 'Unknown error'}`)
    }
  }
}
