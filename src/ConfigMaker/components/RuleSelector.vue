<!-- src/configMaker/components/RuleSelector.vue -->
<template>
  <SettingItem label="適用するルール" description="選択されたフィルタールールを適用します">
    <div class="flex gap-2 items-center">
      <select :value="store.data.target" @change="handleTargetChange" class="select select-bordered w-full max-w-xs">
        <option value="">ルールOFF</option>
        <option v-for="(preset, key) in store.data.presets" :key="key" :value="key">
          {{ preset.name || key }}
        </option>
      </select>
    </div>
  </SettingItem>
</template>

<script setup lang="ts">
  import SettingItem from '@shared/components/parts/SettingItem.vue'
  import { useCommentCutterStore } from '../../stores/pluginStore'

  const store = useCommentCutterStore()

  const handleTargetChange = (event: Event) => {
    const target = (event.target as HTMLSelectElement).value
    try {
      if (target) {
        store.setActivePreset(target)
      } else {
        store.clearActivePreset()
      }
    } catch (error) {
      console.error('Failed to change target:', error)
    }
  }
</script>
