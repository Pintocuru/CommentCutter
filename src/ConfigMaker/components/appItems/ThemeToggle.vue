<!-- src\ConfigMaker\components\appItems\ThemeToggle.vue -->
<template>
  <label class="swap swap-rotate fixed top-6 right-6 z-[9999]">
    <input type="checkbox" v-model="showDark" />
    <Moon class="swap-on w-8 h-8 text-primary" />
    <Sun class="swap-off w-8 h-8 text-primary" />
  </label>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useCommentCutterStore } from '@/stores/pluginStore'
  import { storeToRefs } from 'pinia'
  import { Sun, Moon } from 'lucide-vue-next'

  const store = useCommentCutterStore()
  const { data } = storeToRefs(store)

  const showDark = computed({
    get: () => data.value.theme === 'dark',
    set: (val: boolean) => {
      store.editorState.setTheme(val ? 'dark' : 'light')
    },
  })
</script>
