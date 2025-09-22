// src/services/dataService.ts
import { SETTINGS } from '@/types/settings'
import { PluginResponse } from '@onecomme.com/onesdk/'
import fs from 'fs/promises'
import path from 'path'

// データ構造の型定義
interface DataStructure {
  [generatorName: string]: PackageInfo[]
}

interface PackageInfo {
  name: string
  fileCount: number
  files: string[]
}

interface FileData {
  fileName: string
  data: any
}

// 特定のIDのデータを取得
export async function getSpecificData(folderPath: string, id: string): Promise<PluginResponse> {
  try {
    const files = await fs.readdir(folderPath)
    const targetFile = files.find((file) => file.includes(id) && file.endsWith('.json'))

    if (!targetFile) {
      return {
        code: 404,
        response: JSON.stringify({ error: `Data with ID '${id}' not found` }),
      }
    }

    const filePath = path.join(folderPath, targetFile)
    const data = await fs.readFile(filePath, 'utf8')

    return {
      code: 200,
      response: data,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      code: 500,
      response: JSON.stringify({ error: 'Failed to read specific data', details: errorMessage }),
    }
  }
}

// フォルダ内の全データを取得
export async function getAllDataInFolder(folderPath: string): Promise<PluginResponse> {
  try {
    const files = await fs.readdir(folderPath)
    const jsonFiles = files.filter((file) => file.endsWith('.json'))

    const allData: FileData[] = []
    for (const file of jsonFiles) {
      const filePath = path.join(folderPath, file)
      const data = await fs.readFile(filePath, 'utf8')
      allData.push({
        fileName: file,
        data: JSON.parse(data),
      })
    }

    return {
      code: 200,
      response: JSON.stringify({
        count: allData.length,
        files: allData,
      }),
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      code: 500,
      response: JSON.stringify({ error: 'Failed to read folder data', details: errorMessage }),
    }
  }
}

// 利用可能なデータの一覧を取得
export async function getDataList(): Promise<PluginResponse> {
  try {
    const generators = await fs.readdir(SETTINGS.dataRoot)
    const dataStructure: DataStructure = {}

    for (const generator of generators) {
      const generatorPath = path.join(SETTINGS.dataRoot, generator)
      const stat = await fs.stat(generatorPath)

      if (stat.isDirectory()) {
        const packages = await fs.readdir(generatorPath)
        dataStructure[generator] = []

        for (const pkg of packages) {
          const pkgPath = path.join(generatorPath, pkg)
          const pkgStat = await fs.stat(pkgPath)

          if (pkgStat.isDirectory()) {
            const files = await fs.readdir(pkgPath)
            const jsonFiles = files.filter((file) => file.endsWith('.json'))

            dataStructure[generator].push({
              name: pkg,
              fileCount: jsonFiles.length,
              files: jsonFiles,
            })
          }
        }
      }
    }

    return {
      code: 200,
      response: JSON.stringify({
        message: 'Available data structure',
        data: dataStructure,
      }),
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      code: 500,
      response: JSON.stringify({ error: 'Failed to get data list', details: errorMessage }),
    }
  }
}
