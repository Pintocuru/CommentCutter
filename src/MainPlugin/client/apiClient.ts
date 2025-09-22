// フロントエンド用のAPIクライアント例
// src/client/apiClient.ts
/*
test ではフォルダがdist という名前
http://localhost:11180/api/plugins/dist` 

interface APIClient {
  savePackage(meta: PackageMetaType, data: any): Promise<any>
  getPackages(generatorName: string, name: string): Promise<any>
  getPackage(generatorName: string, name: string, id: string): Promise<any>
  listAllPackages(): Promise<any>
}

class RestAPIClient implements APIClient {
  private baseURL: string

  constructor(baseURL: string = 'http://localhost:3001/api') {
    this.baseURL = baseURL
  }

  async savePackage(meta: PackageMetaType, data: any) {
    const response = await fetch(`${this.baseURL}/package`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ meta, data })
    })
    return await response.json()
  }

  async getPackages(generatorName: string, name: string) {
    const url = `${this.baseURL}/package?generatorName=${generatorName}&name=${name}`
    const response = await fetch(url)
    return await response.json()
  }

  async getPackage(generatorName: string, name: string, id: string) {
    const url = `${this.baseURL}/package?generatorName=${generatorName}&name=${name}&id=${id}`
    const response = await fetch(url)
    return await response.json()
  }

  async listAllPackages() {
    const response = await fetch(`${this.baseURL}/package`)
    return await response.json()
  }
}
*/
