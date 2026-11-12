// src\ConfigMaker\composables\useAutoSave.ts
import { watch, ref, onUnmounted } from 'vue'
import { useConfigApi } from './useConfigApi'
import { useCommentCutterStore } from '@/stores/pluginStore'
import { toast } from 'vue-sonner'

export const useAutoSave = () => {
  const store = useCommentCutterStore()
  const { saveConfig } = useConfigApi()

  // デバウンス用のタイマーID
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const isSaving = ref(false)

  // 設定可能な値
  const DEBOUNCE_DELAY = 3000 // デバウンス

  // デバウンスタイマーを張り直す
  const schedule = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      void debouncedSave()
    }, DEBOUNCE_DELAY)
  }

  // 保存処理
  const debouncedSave = async () => {
    // 保存中なら完了後にもう一度判定する(編集を取りこぼさない)
    if (isSaving.value) {
      schedule()
      return
    }

    // 保存開始時点のスナップショット(保存中の編集を検知するため)
    const snapshot = JSON.stringify(store.data)

    try {
      isSaving.value = true
      await saveConfig()
      toast.success('保存しました')

      if (JSON.stringify(store.data) === snapshot) {
        store.markAsSaved()
      } else {
        // 保存中に編集された分は未保存のまま → もう一度保存する
        schedule()
      }
    } catch (error) {
      // hasChanged は true のままにする(次の編集、または画面を閉じるときに再試行される)
      toast.error(`保存に失敗しました:${error}`)
    } finally {
      isSaving.value = false
    }
  }

  // 自動保存の設定
  const setupAutoSave = () => {
    // 編集のたびにデバウンスを張り直す
    // (hasChanged の false→true だけを見ていると、連続編集や保存中の編集を拾えない)
    watch(
      () => store.data,
      () => {
        if (store.hasChanged && store.isInitialized) schedule()
      },
      { deep: true }
    )
  }

  // 即座に保存（手動保存用）
  const forceSave = async () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    if (store.hasChanged) {
      await debouncedSave()
    }
  }

  // クリーンアップ
  const cleanup = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  // コンポーネントがアンマウントされる時のクリーンアップ
  onUnmounted(() => {
    cleanup()
  })

  return {
    setupAutoSave,
    forceSave, // 手動で即座に保存したい場合用
    isSaving, // 保存中かどうかの状態
    cleanup,
  }
}
