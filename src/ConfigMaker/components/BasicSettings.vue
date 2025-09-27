<!-- src/configMaker/components/PresetBasicSettings.vue -->
<template>
  <div class="space-y-4">
    <!-- ルール名 -->
    <SettingItem label="ルール名" description="プリセットの名前を入力してください">
      <input type="text" v-model="name" class="input w-full" placeholder="プリセット名" />
    </SettingItem>

    <!-- 説明 -->
    <SettingItem label="説明" description="プリセットの説明を入力してください">
      <input type="text" v-model="description" class="input w-full" placeholder="説明（任意）" />
    </SettingItem>

    <!-- ブラックリスト設定 -->
    <SettingItem label="ブラックリストモード" description="ONで該当を排除。OFFにすると、ホワイトモード(該当以外を排除)">
      <input type="checkbox" v-model="isBlacklist" class="toggle toggle-primary" />
    </SettingItem>

    <!-- 読み上げフィルター設定 -->
    <SettingItem label="読み上げフィルター" description="ONの場合、該当したコメントの読み上げのみをフィルターします">
      <input type="checkbox" v-model="isFilterSpeech" class="toggle toggle-primary" />
    </SettingItem>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useCommentCutterStore } from '../../stores/pluginStore'
  import SettingItem from '@shared/components/parts/SettingItem.vue'
  import { PresetType } from '@/types/type'

  const store = useCommentCutterStore()

  // 共通 update 関数
  const updateAction = (updates: Partial<PresetType>) => {
    if (store.selectedPresetId) {
      store.updatePreset(store.selectedPresetId, updates)
    }
  }

  // name
  const name = computed({
    get: () => store.selectedPreset?.name || '',
    set: (value) => updateAction({ name: value }),
  })

  // description
  const description = computed({
    get: () => store.selectedPreset?.description || '',
    set: (value) => updateAction({ description: value }),
  })

  // isBlacklist
  const isBlacklist = computed({
    get: () => store.selectedPreset?.isBlacklist ?? true,
    set: (value) => updateAction({ isBlacklist: value }),
  })

  // isFilterSpeech
  const isFilterSpeech = computed({
    get: () => store.selectedPreset?.isFilterSpeech ?? false,
    set: (value) => updateAction({ isFilterSpeech: value }),
  })
</script>
