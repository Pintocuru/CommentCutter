<!-- src/configMaker/App.vue -->
<template>
  <div class="p-4 max-w-6xl min-w-xl pb-64 overflow-x-hidden mx-auto" :data-theme="data.theme">
    <!-- タイトル -->
    <h1 class="flex justify-center text-2xl font-bold mb-6 text-center relative">
      <div class="flex items-center gap-2">コメントカッタープラグイン コンフィグエディター</div>
    </h1>

    <!-- 適用するルール選択 -->
    <RuleSelector />

    <!-- プリセット管理セクション -->
    <PresetManager />
  </div>

  <!-- 表示トグルボタン -->
  <label class="swap swap-rotate fixed top-6 right-6 z-[9999]">
    <input type="checkbox" v-model="showDark" />

    <!-- Dark モード時: 月アイコン -->
    <Moon class="swap-on w-8 h-8 text-primary" />

    <!-- Light モード時: 太陽アイコン -->
    <Sun class="swap-off w-8 h-8 text-primary" />
  </label>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref, watch } from 'vue'
  import RuleSelector from './components/RuleSelector.vue'
  import PresetManager from './components/PresetManager.vue'
  import { useCommentCutterStore } from '../stores/pluginStore'
  import { useConfigApi } from './composables/useConfigApi'
  import { useAutoSave } from './composables/useAutoSave'
  import { storeToRefs } from 'pinia'
  import { Sun, Moon } from 'lucide-vue-next'

  const store = useCommentCutterStore()
  const { data } = storeToRefs(store)
  const configApi = useConfigApi()
  const { setupAutoSave, forceSave } = useAutoSave()

  // テーマ切替フラグ
  const showDark = ref(false)

  // showDark が切り替わったら DaisyUI テーマを更新
  watch(showDark, (val) => {
    store.editorState.setTheme(val ? 'dark' : 'light')
  })

  // 初期化処理
  onMounted(async () => {
    try {
      await configApi.initializeConfig()

      // 最初のプリセットを自動選択
      const presetKeys = Object.keys(store.data.presets)
      if (presetKeys.length > 0) {
        store.selectPreset(presetKeys[0])
      }

      // デフォルトをテーマに反映
      showDark.value = data.value.theme === 'dark'

      // 自動保存を設定
      setupAutoSave()
    } catch (error) {
      console.error('Failed to initialize app:', error)
    }
  })

  // クリーンアップ処理
  onUnmounted(async () => {
    if (store.hasChanged) {
      await forceSave()
    }
  })
</script>
