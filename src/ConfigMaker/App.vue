<!-- src/configMaker/App.vue -->
<template>
  <div class="p-4 max-w-6xl min-w-xl pb-64 overflow-x-hidden mx-auto" data-theme="dark">
    <!-- タイトル -->
    <h1 class="flex justify-center text-2xl font-bold mb-6 text-center relative">
      <div class="flex items-center gap-2">コメントカッタープラグイン コンフィグエディター</div>
    </h1>

    <!-- 適用するルール -->
    <SettingItem label="適用するルール" description="選択されたフィルタールールを適用します">
      <div class="flex gap-2 items-center">
        <select :value="store.data.target" @change="handleTargetChange" class="select select-bordered w-full max-w-xs">
          <option value="">ルールOFF</option>
          <option v-for="(preset, key) in store.data.presets" :key="key" :value="key">
            {{ preset.name || key }}
          </option>
        </select>
      </div>
    </SettingItem>

    <!-- プリセット管理タブ -->
    <div class="space-y-4">
      <!-- プリセット追加ボタン -->
      <div class="flex justify-between items-center">
        <button @click="addNewPreset" class="btn btn-primary btn-sm">新しいプリセットを追加</button>
      </div>

      <!-- プリセットがない場合 -->
      <div v-if="!store.hasPresets">
        <NoParamsCard message="プリセットがありません" sub="新しいプリセットを追加してください" />
      </div>

      <!-- プリセットタブ -->
      <div v-if="store.hasPresets">
        <div class="tabs tabs-lifted">
          <a
            v-for="(preset, key) in store.data.presets"
            :key="key"
            class="tab"
            :class="{ 'tab-active': store.selectedPresetId === key }"
            @click="store.selectPreset(key)"
          >
            {{ preset.name || key }}
          </a>
        </div>

        <!-- 選択されたプリセットの編集 -->
        <div v-if="store.selectedPreset" class="card bg-base-200 mt-4">
          <div class="card-title p-4 rounded-t justify-between bg-primary text-primary-content">
            <div class="flex items-center gap-2">
              {{ store.selectedPreset.name }}
            </div>
            <div class="flex gap-2">
              <MenuDropdown @duplicate="duplicateCurrentPreset" @delete="deleteCurrentPreset" />
            </div>
          </div>

          <div class="card-body space-y-4">
            <!-- バリデーションエラー表示 -->
            <div v-if="validationErrors.length > 0" class="alert alert-error">
              <ul class="list-disc list-inside">
                <li v-for="error in validationErrors" :key="error">{{ error }}</li>
              </ul>
            </div>

            <!-- 基本設定 -->
            <BasicSettings />

            <!-- 発火条件設定（仮置き） -->
            <SettingItem label="発火条件" description="コメントカッターの発火条件を設定します">
              <div class="p-4 bg-base-300 rounded-lg">
                <p class="text-sm text-gray-500">※ この部分は既存の編集コンポーネントに置き換えてください</p>
                <pre class="text-xs mt-2">{{ JSON.stringify(store.selectedPreset.threshold, null, 2) }}</pre>
              </div>
            </SettingItem>
          </div>
        </div>
      </div>
    </div>
    <!-- デバッグ情報 -->
    <DebugInfo />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import SettingItem from '@shared/components/parts/SettingItem.vue'
  import { useCommentCutterStore } from '../stores/pluginStore'
  import type { DataSchemaType, PresetType } from '../types/type'
  import { SETTINGS } from '@/types/settings'
  import OneSDK from '@onecomme.com/onesdk'
  import NoParamsCard from '@shared/components/parts/NoParamsCard.vue'
  import MenuDropdown from '@shared/components/parts/MenuDropdown.vue'
  import DebugInfo from './components/DebugInfo.vue'
  import BasicSettings from './components/BasicSettings.vue'

  // ストアの使用
  const store = useCommentCutterStore()

  // バリデーションエラーの状態
  const validationErrors = computed(() => {
    if (!store.selectedPreset) return []
    return store.validatePreset(store.selectedPreset)
  })

  // エディター用API（仮実装）
  const editorApi = {
    async loadConfig(): Promise<DataSchemaType> {
      // 実際の実装では独自SDKを使用
      console.log('Loading config from API...')
      // 仮のデータを返す
      return {
        target: '',
        presets: {
          demo_preset: {
            id: 'demo_preset',
            key: 'demo_preset',
            name: 'デモプリセット',
            description: 'これはデモ用のプリセットです',
            isBlacklist: true,
            isFilterSpeech: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            threshold: {
              conditions: ['comment'],
              comment: ['おみくじ'],
            },
          },
        },
      }
    },

    async saveConfig(data: DataSchemaType): Promise<void> {
      // 実際の実装では独自SDKを使用
      console.log('Saving config to API...', data)
      // 仮の保存処理
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
  }

  // イベントハンドラー
  const handleTargetChange = (event: Event) => {
    const target = (event.target as HTMLSelectElement).value
    if (target) {
      store.setActivePreset(target)
    } else {
      store.clearActivePreset()
    }
  }

  const handlePresetBlacklistChange = (event: Event) => {
    const isBlacklist = (event.target as HTMLInputElement).checked
    if (store.selectedPresetId) {
      store.updatePreset(store.selectedPresetId, { isBlacklist })
    }
  }

  const handlePresetSpeechFilterChange = (event: Event) => {
    const isFilterSpeech = (event.target as HTMLInputElement).checked
    if (store.selectedPresetId) {
      store.updatePreset(store.selectedPresetId, { isFilterSpeech })
    }
  }

  // プリセット操作
  // TODO:スキーマを使って
  const addNewPreset = () => {
    const newPreset: Partial<PresetType> = {
      id: `preset_${Date.now()}`,
      name: '新しいプリセット',
      description: '',
      isBlacklist: true,
      isFilterSpeech: false,
      threshold: {
        conditions: [],
      },
    }

    try {
      store.addPreset(newPreset)
    } catch (error) {
      console.error('Failed to add preset:', error)
    }
  }

  const deleteCurrentPreset = () => {
    if (!store.selectedPresetId) return

    if (confirm('このプリセットを削除しますか？')) {
      try {
        store.removePreset(store.selectedPresetId)
      } catch (error) {
        console.error('Failed to delete preset:', error)
      }
    }
  }

  const duplicateCurrentPreset = () => {
    if (!store.selectedPresetId) return

    try {
      store.duplicatePreset(store.selectedPresetId)
    } catch (error) {
      console.error('Failed to duplicate preset:', error)
    }
  }

  // 設定の読み込み・保存
  const loadConfig = async () => {
    try {
      const config = await editorApi.loadConfig()
      store.initialize(config)
      console.log('Config loaded successfully')
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  // メインのデータサービス
  // TODO:実装
  async function AppEditorFetch(): Promise<any> {
    try {
      const response = await ApiClient.request({ method: 'GET', mode: Mode.AllData })
      const data = JSON.parse(response)

      return {
        Presets: data.Presets,
      }
    } catch (error) {
      // エラーハンドリングの実装
      throw error
    }
  }

  // APIクライアント
  class ApiClient {
    private static readonly baseUrl = `${SETTINGS.baseUrl}/plugins/${SETTINGS.PLUGIN_UID}`

    static async request(params: any, data?: object): Promise<string> {
      const config = {
        headers: { 'Content-Type': 'application/json' },
        data: data || {},
      }

      const url = `${this.baseUrl}?mode=${params.mode}&type=${params.type || ''}`

      try {
        const response = params.method === 'GET' ? await OneSDK.get(url, {}) : await OneSDK.post(url, config)

        this.validateResponse(response, params.type)
        return response.data.response
      } catch (error) {
        // エラーハンドリングの実装
        throw error
      }
    }

    // わんコメが起動していない・プラグインが切られた等でデータが帰ってこないなら致命的なエラー
    private static validateResponse(response: any, type: string = ''): void {
      if (!response.data || response.data.code !== 200) {
        // エラーハンドリングの実装
      }
    }
  }

  // 初期化
  onMounted(async () => {
    // エディター用の初期化
    await loadConfig()

    // 最初のプリセットを選択
    const presetKeys = Object.keys(store.data.presets)
    if (presetKeys.length > 0) {
      store.selectPreset(presetKeys[0])
    }
  })
</script>
