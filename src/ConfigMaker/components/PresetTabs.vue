<!-- src/configMaker/components/PresetTabs.vue -->
<template>
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
</template>

<script setup lang="ts">
  import { useCommentCutterStore } from '../../stores/pluginStore'

  const store = useCommentCutterStore()
</script>
