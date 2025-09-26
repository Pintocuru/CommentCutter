<!-- src/configMaker/components/PresetEditorHeader.vue -->
<template>
  <div class="card-title p-4 rounded-t justify-between bg-primary text-primary-content">
    <div class="flex items-center gap-2">
      {{ store.selectedPreset?.name }}
    </div>
    <div class="flex gap-2">
      <MenuDropdown @duplicate="$emit('duplicate')" @delete="$emit('delete')" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import MenuDropdown from '@shared/components/parts/MenuDropdown.vue'
  import { useCommentCutterStore } from '../../stores/pluginStore'

  const store = useCommentCutterStore()

  defineEmits<{
    duplicate: []
    delete: []
  }>()
</script>
