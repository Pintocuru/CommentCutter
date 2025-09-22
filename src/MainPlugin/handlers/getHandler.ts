// src/handlers/getHandler.ts
import { PluginResponse } from '@onecomme.com/onesdk/'
import { getSpecificData, getAllDataInFolder, getDataList } from '../services/dataService'
import { checkFolderExists } from '../utils/fileUtils'
import { SETTINGS } from '@/Modules/settings'
import path from 'path'

export async function handleGetRequest(
  pathSegments: string[],
  params: { [key: string]: string }
): Promise<PluginResponse> {
  try {
    const { generatorName, name, id } = params

    if (!generatorName || !name) {
      // パラメータが不足している場合、利用可能なデータの一覧を返す
      return await getDataList()
    }

    const folderPath = path.join(SETTINGS.dataRoot, generatorName, name)

    const folderExists = await checkFolderExists(folderPath)
    if (!folderExists) {
      return {
        code: 404,
        response: JSON.stringify({ error: 'Data not found for the specified generator and name' }),
      }
    }

    if (id) {
      // 特定のIDのデータを取得
      return await getSpecificData(folderPath, id)
    } else {
      // フォルダ内の全データを取得
      return await getAllDataInFolder(folderPath)
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
