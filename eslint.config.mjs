// [Package] eslint.config.mjs
import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginImport from 'eslint-plugin-import'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM環境での__dirnameの取得
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 環境変数からチェックレベルを取得
const checkLevel = process.env.VITE_TS_CHECK_LEVEL || 'development'

// チェックレベルに応じたルール設定
function getRulesForLevel(level) {
  const baseRules = {
    // コンポーネント名が複数単語かどうかをチェック
    'vue/multi-word-component-names': 0,
  }

  switch (level) {
    // 1. 循環参照のみチェック、他は緩い設定
    case 'development':
      return {
        ...baseRules,
        // ファイル間の循環参照を検出します。
        'import/no-cycle': ['warn', { maxDepth: 3 }],
        // 未使用の変数を許可します。
        '@typescript-eslint/no-unused-vars': 'off',
        // 'any'型の使用を許可します。
        '@typescript-eslint/no-explicit-any': 'off',
        // 明示的な型付けがない場合でも許可します。
        '@typescript-eslint/no-inferrable-types': 'off',
        // 'let'の代わりに'const'を使うことを強制しません。
        'prefer-const': 'off',
        // 空の関数定義を許可します。
        '@typescript-eslint/no-empty-function': 'off',
        // Vueコンポーネント内の未使用変数を許可します。
        'vue/no-unused-vars': 'off',
        // 空のオブジェクト型 '{}' の使用を許可します。
        '@typescript-eslint/no-empty-object-type': 'off',
      }

    case 'beta':
      // 2. 型エラーは厳格、anyは許容
      return {
        ...baseRules,
        // ファイル間の循環参照を検出します。
        'import/no-cycle': ['error', { maxDepth: 3 }],
        // 未使用の変数を警告します。
        '@typescript-eslint/no-unused-vars': 'warn',
        // 'any'型の使用を許可します。
        '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
        // 明示的な型付けがない場合を警告します。
        '@typescript-eslint/no-inferrable-types': 'warn',
        // 'let'の代わりに'const'を使うことを警告します。
        'prefer-const': 'warn',
        // 空の関数定義を警告します。
        '@typescript-eslint/no-empty-function': 'warn',
        // 安全でない代入を許可します。
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        // 安全でないメンバーアクセスを許可します。
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        // 安全でない関数の呼び出しを許可します。
        '@typescript-eslint/no-unsafe-call': 'warn',
        // Vueコンポーネント内の未使用変数を警告します。
        'vue/no-unused-vars': 'warn',
      }

    case 'production':
      // 3. 最も厳格な設定
      return {
        ...baseRules,
        // ファイル間の循環参照を検出します。
        'import/no-cycle': 'error',
        // 未使用の変数をエラーにします。
        '@typescript-eslint/no-unused-vars': 'error',
        // 'any'型の使用をエラーにします。
        '@typescript-eslint/no-explicit-any': 'error',
        // 明示的な型付けがない場合をエラーにします。
        '@typescript-eslint/no-inferrable-types': 'error',
        // 'let'の代わりに'const'を使うことをエラーにします。
        'prefer-const': 'error',
        // 空の関数定義をエラーにします。
        '@typescript-eslint/no-empty-function': 'error',
        // 安全でない代入をエラーにします。
        '@typescript-eslint/no-unsafe-assignment': 'error',
        // 安全でないメンバーアクセスをエラーにします。
        '@typescript-eslint/no-unsafe-member-access': 'error',
        // 安全でない関数の呼び出しをエラーにします。
        '@typescript-eslint/no-unsafe-call': 'error',
        // 安全でない戻り値をエラーにします。
        '@typescript-eslint/no-unsafe-return': 'error',
        // テンプレートリテラル内の型を制限します。
        '@typescript-eslint/restrict-template-expressions': 'error',
        // Vueコンポーネント内の未使用変数をエラーにします。
        'vue/no-unused-vars': 'error',
        // 'v-for'に'key'が必須であることをエラーにします。
        'vue/require-v-for-key': 'error',
        // Vueコンポーネント内の未使用コンポーネントをエラーにします。
        'vue/no-unused-components': 'error',
      }

    default:
      return baseRules
  }
}

console.log(`🔍 ESLint Check Level: ${checkLevel}`)

export default [
  {
    // 対象ファイルの指定
    name: 'app/files-to-lint',
    files: ['**/*.{ts,js,mts,tsx,vue}'],
    languageOptions: {
      parser: 'vue-eslint-parser',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: path.resolve(__dirname),
        extraFileExtensions: ['.vue'],
      },
    },
  },
  {
    // 除外対象（ビルド後のファイルなど）
    name: 'app/files-to-ignore',
    ignores: ['**/node_modules/**', '**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  // Vue の基本的なルールセット（Flat Config用）
  ...pluginVue.configs['flat/essential'],

  // Import plugin の設定
  {
    name: 'import-plugin-config',
    plugins: {
      import: pluginImport,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.ts', '.vue'],
        },
      },
    },
  },

  // TypeScript用の設定をマージ
  /**
   * 'vueTsEslintConfig' のシグネチャ '({ extends: configNamesToExtend, supportedScriptLangs, rootDir, }?: ConfigOptions | undefined): ConfigArray' は非推奨です。ts(6387)
index.d.mts(90, 4): この宣言はここで非推奨とマークされました。
(alias) vueTsEslintConfig({ extends: configNamesToExtend, supportedScriptLangs, rootDir, }?: ConfigOptions): FlatConfig.ConfigArray
import vueTsEslintConfig
@deprecated — Use defineConfigWithVueTs + vueTsConfigs instead.
   */
  ...vueTsEslintConfig(),

  {
    // チェックレベルに応じたルール設定
    name: `app/level-${checkLevel}-rules`,
    rules: getRulesForLevel(checkLevel),
  },

  // Prettier に整形を任せる設定
  skipFormatting,
]
