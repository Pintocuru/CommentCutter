// src/Modules/settings.ts

// 環境変数があるなら開発、そうでないなら本番
export const isDev = import.meta.env?.VITE_IS_DEV || false

// プラグインのUID
const PLUGIN_UID_DEFAULT = 'CommentCutter'
const PLUGIN_UID = import.meta.env?.PLUGIN_UID || PLUGIN_UID_DEFAULT

// 設定オブジェクト SETTINGS
export const SETTINGS: Settings = {
  // ブラウザ環境では、パスは基本的に使わないか、相対パスまたはURL形式で扱う
  dataRoot: isDev
    ? '../../data' // 相対パスとして設定 (ブラウザコードではファイルアクセスは不可)
    : '', // 本番環境（プラグイン側）で必要なら、環境変数などで解決する
  baseUrl: 'http://localhost:11180/api', // わんコメのapi
  PLUGIN_UID: PLUGIN_UID,
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
