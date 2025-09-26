<!-- src/configMaker/components/PresetThresholdSettings.vue -->
<template>
  <SettingItem label="発火条件" description="コメントカッターの発火条件を設定します">
    <div class="p-4 bg-base-300 rounded-lg">
      <p class="text-sm text-gray-500">※ この部分は既存の編集コンポーネントに置き換えてください</p>
      <pre class="text-xs mt-2 overflow-auto">{{ JSON.stringify(store.selectedPreset?.threshold, null, 2) }}</pre>

      <!-- 将来的にはここに専用のThreshold編集コンポーネントを配置 -->
      <!-- <ThresholdEditor v-model="store.selectedPreset.threshold" /> -->
    </div>
  </SettingItem>
</template>

<script setup lang="ts">
  import SettingItem from '@shared/components/parts/SettingItem.vue'
  import { useCommentCutterStore } from '../../stores/pluginStore'

  const store = useCommentCutterStore()

  // TODO: 実際のThreshold編集コンポーネントの実装
  // import ThresholdEditor from './ThresholdEditor.vue'
</script>
