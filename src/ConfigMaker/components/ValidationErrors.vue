<!-- src/configMaker/components/ValidationErrors.vue -->
<template>
  <div v-if="errors.length > 0" class="alert alert-error">
    <ul class="list-disc list-inside">
      <li v-for="error in errors" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    errors: string[]
  }>()
</script>
