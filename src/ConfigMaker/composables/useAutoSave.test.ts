// src/ConfigMaker/composables/useAutoSave.test.ts
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'
import { reactive, nextTick } from 'vue'
import { useAutoSave } from './useAutoSave'

const h = vi.hoisted(() => ({ saveConfig: vi.fn(), store: {} as any }))

vi.mock('@/stores/pluginStore', () => ({ useCommentCutterStore: () => h.store }))
vi.mock('./useConfigApi', () => ({ useConfigApi: () => ({ saveConfig: h.saveConfig }) }))
vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

const DEBOUNCE = 3000

// 編集のシミュレート: データ変更 + hasChanged = true(ストアの各 action と同じ順序)
const edit = async (value: string) => {
  h.store.data.name = value
  h.store.hasChanged = true
  await nextTick()
}

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {}) // onUnmounted をコンポーネント外で呼ぶ警告
    vi.spyOn(console, 'log').mockImplementation(() => {})
    h.saveConfig.mockReset()
    h.store = reactive({
      data: { name: 'init' },
      hasChanged: false,
      isInitialized: true,
      markAsSaved() {
        this.hasChanged = false
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('連続して編集すると、最後の編集から一定時間後に1回だけ保存する', async () => {
    h.saveConfig.mockResolvedValue(undefined)
    useAutoSave().setupAutoSave()

    await edit('a')
    await vi.advanceTimersByTimeAsync(2000)
    await edit('b') // タイマーが張り直される
    await vi.advanceTimersByTimeAsync(2000)
    expect(h.saveConfig).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1000)
    expect(h.saveConfig).toHaveBeenCalledTimes(1)
    expect(h.store.hasChanged).toBe(false)
  })

  test('保存中に行った編集は取りこぼさず、完了後にもう一度保存する', async () => {
    let finishFirstSave!: () => void
    h.saveConfig
      .mockImplementationOnce(() => new Promise<void>((resolve) => (finishFirstSave = resolve)))
      .mockResolvedValue(undefined)
    useAutoSave().setupAutoSave()

    await edit('a')
    await vi.advanceTimersByTimeAsync(DEBOUNCE) // 1回目の保存が開始(未完了)
    expect(h.saveConfig).toHaveBeenCalledTimes(1)

    await edit('b') // 保存中の編集
    finishFirstSave()
    await vi.advanceTimersByTimeAsync(0)
    expect(h.store.hasChanged).toBe(true) // 'b' はまだ保存されていない

    await vi.advanceTimersByTimeAsync(DEBOUNCE)
    expect(h.saveConfig).toHaveBeenCalledTimes(2)
    expect(h.store.hasChanged).toBe(false)
  })

  test('保存に失敗したら hasChanged は true のまま残り、次の編集で再試行される', async () => {
    h.saveConfig.mockRejectedValueOnce(new Error('network')).mockResolvedValue(undefined)
    useAutoSave().setupAutoSave()

    await edit('a')
    await vi.advanceTimersByTimeAsync(DEBOUNCE)
    expect(h.saveConfig).toHaveBeenCalledTimes(1)
    expect(h.store.hasChanged).toBe(true) // 「保存済み」にしない

    await edit('b')
    await vi.advanceTimersByTimeAsync(DEBOUNCE)
    expect(h.saveConfig).toHaveBeenCalledTimes(2)
    expect(h.store.hasChanged).toBe(false)
  })

  test('hasChanged が false のときは(初期化などでデータが変わっても)保存しない', async () => {
    useAutoSave().setupAutoSave()

    h.store.data.name = 'loaded-from-api'
    await nextTick()
    await vi.advanceTimersByTimeAsync(DEBOUNCE * 2)
    expect(h.saveConfig).not.toHaveBeenCalled()
  })
})
