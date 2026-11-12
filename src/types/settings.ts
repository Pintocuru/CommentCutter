// src/Modules/settings.ts

// 環境変数があるなら開発、そうでないなら本番
// 環境変数は文字列で渡ってくる('false' が真と判定されないよう真偽値へ変換する)
const toBool = (value: unknown, fallback: boolean): boolean =>
  value === undefined || value === '' ? fallback : value === true || value === 'true'

export const isDev = toBool(import.meta.env?.VITE_IS_DEV, false)
// .env.development は VITE_USE_REAL_API を使っているため、両方の名前を受け付ける
export const isRealApi = toBool(import.meta.env?.VITE_IS_REAL_API ?? import.meta.env?.VITE_USE_REAL_API, true)

// プラグインのUID
const PLUGIN_UID_DEFAULT = 'FilterAdvance'
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
