// C:\_root\_nodejs\OmikenTemplates\templates\CommentCutter\src\ConfigMaker\composables\useAutoSave.ts
import { watch, ref, onUnmounted } from 'vue'
import { useCommentCutterStore } from '@/stores/pluginStore'
import { useConfigApi } from './useConfigApi'
import { isDev, isRealApi } from '@/types/settings'

export const useAutoSave = () => {
  const store = useCommentCutterStore()
  const { saveConfig } = useConfigApi()

  // デバウンス用のタイマーID
  let debounceTimer: NodeJS.Timeout | null = null
  const isSaving = ref(false)

  // 設定可能な値
  const DEBOUNCE_DELAY = 2000 // 2秒のデバウンス

  // デバウンス付き保存関数
  const debouncedSave = async () => {
    if (isSaving.value) return // 既に保存中の場合はスキップ

    try {
      isSaving.value = true

      if (isDev && !isRealApi) {
        console.log('🔄 Auto-save triggered (dev mode - no actual API call)')
        // 開発環境でも少し遅延を入れて実際の保存をシミュレート
        await new Promise((resolve) => setTimeout(resolve, 100))
      } else {
        console.log('🔄 Auto-saving configuration...')
        await saveConfig()
        console.log('✅ Configuration auto-saved successfully')
      }

      // 保存完了後、hasChanged を false にリセット
      store.markAsSaved()
    } catch (error) {
      console.error('❌ Auto-save failed:', error)
      // エラーが発生した場合でも hasChanged は false にして無限ループを防ぐ
      store.markAsSaved()
    } finally {
      isSaving.value = false
    }
  }

  // 自動保存の設定
  const setupAutoSave = () => {
    // hasChanged が true になるたびにデバウンス付きで自動保存を実行
    watch(
      () => store.hasChanged,
      (newValue) => {
        if (newValue && store.isInitialized) {
          // 既存のタイマーをクリア
          if (debounceTimer) {
            clearTimeout(debounceTimer)
          }

          // 新しいタイマーを設定
          debounceTimer = setTimeout(() => {
            debouncedSave()
          }, DEBOUNCE_DELAY)

          console.log(`⏰ Auto-save scheduled in ${DEBOUNCE_DELAY}ms`)
        }
      },
      { immediate: false } // 初期化時は実行しない
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
