// src/utils/fileUtils.ts
import { SETTINGS } from '@/Modules/settings'
import { PackageMetaType } from '@shared/types'
import fs from 'fs/promises'
import path from 'path'

// データディレクトリの初期化
export async function initializeDataDirectory(): Promise<void> {
  try {
    await fs.access(SETTINGS.dataRoot)
  } catch {
    await fs.mkdir(SETTINGS.dataRoot, { recursive: true })
  }
}

// フォルダの存在確認
export async function checkFolderExists(folderPath: string): Promise<boolean> {
  try {
    await fs.access(folderPath)
    return true
  } catch {
    return false
  }
}

// データをファイルに保存
export async function saveDataToFile(meta: PackageMetaType, body: any): Promise<string> {
  // フォルダパスを生成 (generatorName/name)
  const folderPath = path.join(SETTINGS.dataRoot, meta.generatorName, meta.name)

  // ディレクトリを作成（存在しない場合）
  await fs.mkdir(folderPath, { recursive: true })

  // ファイル名を生成（IDまたはタイムスタンプベース）
  const fileName = `${meta.id || Date.now()}.json`
  const filePath = path.join(folderPath, fileName)

  // データを保存
  await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf8')

  return filePath
}
