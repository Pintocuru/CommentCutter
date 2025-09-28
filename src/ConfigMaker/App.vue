<!-- src/configMaker/App.vue -->
<template>
  <div v-if="isInitialized">
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
    <ThemeToggle />

    <!-- トースト通知 -->
    <Toaster :expand="true" :richColors="true" :visibleToasts="5" />
  </div>
  <div v-else>
    <ErrorInitComponent :isPlugin="true" pluginName="コメントカッタープラグイン" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'
  import RuleSelector from './components/RuleSelector.vue'
  import PresetManager from './components/PresetManager.vue'
  import ThemeToggle from './components/appItems/ThemeToggle.vue'
  import { useCommentCutterStore } from '../stores/pluginStore'
  import { useConfigApi } from './composables/useConfigApi'
  import { useAutoSave } from './composables/useAutoSave'
  import ErrorInitComponent from '@shared/components/error/ErrorInfoDaisy.vue'
  import { storeToRefs } from 'pinia'
  import { Toaster } from 'vue-sonner'

  const store = useCommentCutterStore()
  const { data, isInitialized } = storeToRefs(store)
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
    if (store.hasChanged) {
      await forceSave()
    }
  })
</script>
