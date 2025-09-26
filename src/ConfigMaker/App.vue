<!-- src/configMaker/App.vue -->
<template>
  <div class="p-4 max-w-6xl min-w-xl pb-64 overflow-x-hidden mx-auto" :data-theme="data.theme">
    <!-- タイトル -->
    <AppHeader />

    <!-- 適用するルール選択 -->
    <RuleSelector />

    <!-- プリセット管理セクション -->
    <PresetManager />

    <!-- デバッグ情報 -->
    <DebugInfo />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'
  import AppHeader from './components/AppHeader.vue'
  import RuleSelector from './components/RuleSelector.vue'
  import PresetManager from './components/PresetManager.vue'
  import DebugInfo from './components/DebugInfo.vue'
  import { useCommentCutterStore } from '../stores/pluginStore'
  import { useConfigApi } from './composables/useConfigApi'
  import { useAutoSave } from './composables/useAutoSave'
  import { storeToRefs } from 'pinia'

  const store = useCommentCutterStore()
  const { data } = storeToRefs(store)
  const configApi = useConfigApi()
  const { setupAutoSave, forceSave } = useAutoSave()

  // 初期化処理

  onMounted(async () => {
    try {
      await configApi.initializeConfig()

      // 最初のプリセットを自動選択
      const presetKeys = Object.keys(store.data.presets)
      if (presetKeys.length > 0) {
        store.selectPreset(presetKeys[0])
      }

      // 自動保存を設定
      setupAutoSave()
    } catch (error) {
      console.error('Failed to initialize app:', error)
    }
  })

  // クリーンアップ処理
  onUnmounted(async () => {
    // 未保存があれば強制保存してからクリーンアップ
    if (store.hasChanged) {
      await forceSave()
    }
  })
</script>
