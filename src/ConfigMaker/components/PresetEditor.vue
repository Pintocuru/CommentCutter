<!-- src/configMaker/components/PresetEditor.vue -->
<template>
  <div v-if="store.selectedPreset" class="card bg-base-200 mt-4">
    <!-- カードヘッダー -->
    <PresetEditorHeader @duplicate="duplicateCurrentPreset" @delete="deleteCurrentPreset" />

    <div class="card-body space-y-4">
      <!-- バリデーションエラー表示 -->
      <ValidationErrors :errors="validationErrors" />

      <!-- 基本設定 -->
      <BasicSettings />

      <!-- 発火条件設定 -->
      <PresetThresholdSettings />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import PresetEditorHeader from './PresetEditorHeader.vue'
  import ValidationErrors from './ValidationErrors.vue'
  import BasicSettings from './BasicSettings.vue'
  import PresetThresholdSettings from './PresetThresholdSettings.vue'
  import { useCommentCutterStore } from '../../stores/pluginStore'
  import { usePresetOperations } from '../composables/usePresetOperations'

  const store = useCommentCutterStore()
  const { duplicateCurrentPreset, deleteCurrentPreset } = usePresetOperations()

  // バリデーションエラーの状態
  const validationErrors = computed(() => {
    if (!store.selectedPreset) return []
    return store.validatePreset(store.selectedPreset)
  })
</script>
