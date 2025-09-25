<!-- src/configMaker/components/DebugInfo.vue -->
<template>
  <div class="collapse collapse-arrow bg-base-200 mt-4">
    <input type="checkbox" />
    <div class="collapse-title text-xl font-medium">デバッグ情報</div>
    <div class="collapse-content">
      <div class="space-y-2">
        <div><strong>初期化状態:</strong> {{ store.isInitialized }}</div>
        <div><strong>プリセット数:</strong> {{ Object.keys(store.data.presets).length }}</div>
        <div><strong>アクティブプリセット:</strong> {{ store.data.target || 'なし' }}</div>
        <div><strong>選択中プリセット:</strong> {{ store.selectedPresetId || 'なし' }}</div>
      </div>
      <pre class="text-xs mt-4 overflow-auto">{{ JSON.stringify(store.data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useCommentCutterStore } from '../../stores/pluginStore'

  const store = useCommentCutterStore()
</script>
