<!-- src/configMaker/components/PresetManager.vue -->
<template>
  <div class="space-y-4">
    <!-- プリセット追加ボタン -->
    <div class="flex justify-between items-center">
      <button @click="addNewPreset" class="btn btn-primary btn-sm">新しいプリセットを追加</button>
    </div>

    <!-- プリセットがない場合 -->
    <div v-if="!store.hasPresets">
      <NoParamsCard message="プリセットがありません" sub="新しいプリセットを追加してください" />
    </div>

    <!-- プリセットタブとエディター -->
    <div v-if="store.hasPresets">
      <!-- プリセットタブ -->
      <PresetTabs />

      <!-- エディター -->
      <PresetEditor />
    </div>
  </div>
</template>

<script setup lang="ts">
  import NoParamsCard from '@shared/components/parts/NoParamsCard.vue'
  import PresetTabs from './PresetTabs.vue'
  import PresetEditor from './PresetEditor.vue'
  import { useCommentCutterStore } from '../../stores/pluginStore'
  import { usePresetOperations } from '../composables/usePresetOperations'

  const store = useCommentCutterStore()
  const { addNewPreset } = usePresetOperations()
</script>
