<!-- src/configMaker/components/PresetEditor.vue -->
<template>
  <div v-if="store.selectedPreset" class="card bg-base-200 mt-4">
    <!-- カードヘッダー -->
    <PresetEditorHeader @duplicate="duplicateCurrentPreset" @delete="deleteCurrentPreset" />
    <div class="card-body space-y-4">
      <SectionCard :isOpen="true" title="基本設定" description="プレースホルダー名の設定を行います">
        <!-- バリデーションエラー表示 -->
        <ValidationErrors :errors="validationErrors" />

        <!-- 基本設定 -->
        <BasicSettings />
      </SectionCard>

      <!-- 発動条件設定 -->
      <SectionCard :isOpen="true" title="発動条件設定" description="コメントをフィルタリングする発動条件の設定">
        <PresetThresholdSettings />
      </SectionCard>
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
  import SectionCard from '@shared/components/parts/SectionCard.vue'

  const store = useCommentCutterStore()
  const { duplicateCurrentPreset, deleteCurrentPreset } = usePresetOperations()

  // バリデーションエラーの状態
  const validationErrors = computed(() => {
    if (!store.selectedPreset) return []
    return store.validatePreset(store.selectedPreset)
  })
</script>
