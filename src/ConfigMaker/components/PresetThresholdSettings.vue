<!-- src/configMaker/components/PresetThresholdSettings.vue -->
<template>
  <!-- 条件設定の説明 -->
  <InformationCard>
    <p>
      <code class="label bg-accent text-accent-content"
        >コメントテスターのコメントは、設定にかかわらず、必ず表示されます。</code
      >
      テストを行う際はご注意下さい。
    </p>
    <p>
      <code class="label bg-accent text-accent-content">発動条件が複数の場合は、すべての条件を満たしたときだけ</code
      >ルールが発動します。
    </p>
  </InformationCard>

  <!-- 条件タイプ選択 -->
  <SettingItem label="適用する発動条件" description="トリガーの種類を選択">
    <div class="flex flex-wrap gap-2">
      <label
        v-for="condition in conditionTypes"
        :key="condition.value"
        class="flex items-center gap-2 hover:bg-base-300 p-2 rounded cursor-pointer"
      >
        <input
          type="checkbox"
          class="checkbox checkbox-primary"
          :checked="conditions?.includes(condition.value) ?? false"
          @change="toggleCondition(condition.value)"
        />
        <span class="text-sm">{{ condition.label }}</span>
      </label>
    </div>
  </SettingItem>

  <!-- 各条件の詳細設定 -->
  <!-- チャットワード条件 -->
  <ThresholdComment v-if="conditions?.includes('comment')" v-model="comment" />

  <!-- アクセスレベル条件 -->
  <ThresholdAccess v-if="conditions?.includes('access')" v-model="access" />

  <!-- ギフト条件 -->
  <ThresholdGift v-if="conditions?.includes('gift')" v-model="gift" />

  <!-- カウント条件 -->
  <ThresholdCount v-if="conditions?.includes('count')" v-model="count" />

  <!-- ユーザーID条件 -->
  <ThresholdUserId v-if="conditions?.includes('userId')" v-model="userId" />

  <!-- ユーザー名条件 -->
  <ThresholdUsername v-if="conditions?.includes('username')" v-model="username" />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import {
    CutterThresholdCondition,
    CutterThresholdConditionLabels,
    CutterThresholdType,
  } from '@/types/CutterThresholdSchema'
  import SettingItem from '@shared/components/parts/SettingItem.vue'
  import { useCommentCutterStore } from '../../stores/pluginStore'

  import ThresholdComment from '@shared/components/threshold/ThresholdComment.vue'
  import ThresholdAccess from '@shared/components/threshold/ThresholdAccess.vue'
  import ThresholdGift from '@shared/components/threshold/ThresholdGift.vue'
  import ThresholdCount from '@shared/components/threshold/ThresholdCount.vue'
  import ThresholdUserId from '@shared/components/threshold/ThresholdUserId.vue'
  import ThresholdUsername from '@shared/components/threshold/ThresholdUsername.vue'
  import InformationCard from '@shared/components/parts/InformationCard.vue'

  const store = useCommentCutterStore()

  // 各プロパティのcomputed getter/setter
  const createComputed = <T extends keyof CutterThresholdType>(key: T) =>
    computed({
      get: () => store.selectedPreset?.threshold[key],
      set: (value) => {
        if (!store.selectedPreset) return
        const updated = {
          ...store.selectedPreset,
          threshold: {
            ...store.selectedPreset.threshold,
            [key]: value,
          },
        }
        store.updatePreset(store.selectedPreset.key, updated)
      },
    })

  // 各プロパティのcomputed
  const conditions = createComputed('conditions')
  const comment = createComputed('comment')
  const access = createComputed('access')
  const gift = createComputed('gift')
  const count = createComputed('count')
  const userId = createComputed('userId')
  const username = createComputed('username')

  // 条件タイプの選択肢
  const conditionTypes = Object.entries(CutterThresholdConditionLabels).map(([value, label]) => ({
    value: value as CutterThresholdCondition,
    label,
  }))

  // Utils
  const toggleInArray = <T,>(array: T[], value: T): T[] => {
    const index = array.indexOf(value)
    return index > -1 ? array.filter((_, i) => i !== index) : [...array, value]
  }

  // Handlers
  const toggleCondition = (condition: CutterThresholdCondition) => {
    const currentConditions = conditions.value ?? []
    conditions.value = toggleInArray(currentConditions, condition)
  }
</script>
