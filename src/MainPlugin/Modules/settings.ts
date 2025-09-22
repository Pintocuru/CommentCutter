// src/Modules/settings.ts
import path from 'path'

// 環境変数 NODE_ENV=development を設定していれば開発、そうでないなら本番
export const isDev = process.env.NODE_ENV === 'development'

// 設定オブジェクト SETTINGS
export const SETTINGS: Settings = {
  dataRoot: isDev
    ? path.join(__dirname, '../../../data') // 開発環境用
    : path.join(__dirname, ''), // 本番環境用
  baseUrl: 'http://localhost:11180/api', // わんコメのapi
  PLUGIN_UID: path.basename(path.resolve(__dirname)) || 'ConfigPlugin',
  botUserId: 'FirstCounter',
  botName: 'Botちゃん',
}

interface Settings {
  dataRoot: string
  baseUrl: string
  PLUGIN_UID: string
  botUserId: string
  botName: string
}
