// src/MainPlugin/scripts/filterLogic/filterLogic.test.ts
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { handleFilterComment } from './filterLogic'
import { checkAllConditions } from '@shared/utils/threshold/ThresholdChecker'
import { ElectronStoreManager } from '../../store/ElectronStoreManager'
import { MockCommentSchema } from '@shared/test-utils/CreateMockComment'

vi.mock('@shared/utils/threshold/ThresholdChecker', () => ({ checkAllConditions: vi.fn() }))
vi.mock('@shared/sdk/postMessage/ConsolePost', () => ({ ConsolePost: vi.fn() }))
vi.mock('../../store/ElectronStoreManager', () => ({
  ElectronStoreManager: { getInstance: vi.fn() },
}))

type PresetOptions = { isBlacklist: boolean; isFilterSpeech: boolean; conditions?: unknown[] }

// currentPreset() が返す値を差し替えるヘルパー
function setPreset(preset: PresetOptions | null) {
  const value = preset && {
    isBlacklist: preset.isBlacklist,
    isFilterSpeech: preset.isFilterSpeech,
    threshold: { conditions: preset.conditions ?? [{}] },
  }
  vi.mocked(ElectronStoreManager.getInstance).mockReturnValue({
    currentPreset: () => value,
  } as unknown as ElectronStoreManager)
}

const setMatched = (matched: boolean) => vi.mocked(checkAllConditions).mockReturnValue(matched)
const makeComment = (data: Record<string, unknown> = {}) =>
  MockCommentSchema.parse({ data: { comment: 'test', speechText: 'test', ...data } })

describe('handleFilterComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('素通しになるケース', () => {
    test('プリセットが無ければコメントをそのまま返す', async () => {
      setPreset(null)
      const comment = makeComment()
      expect(await handleFilterComment(comment)).toBe(comment)
    })

    test('条件が空ならコメントをそのまま返す', async () => {
      setPreset({ isBlacklist: true, isFilterSpeech: false, conditions: [] })
      const comment = makeComment()
      expect(await handleFilterComment(comment)).toBe(comment)
      expect(checkAllConditions).not.toHaveBeenCalled()
    })

    test.each(['info', 'error'])('COMMENT_TESTER の %s は常に通す', async (name) => {
      setPreset({ isBlacklist: true, isFilterSpeech: false })
      setMatched(true)
      const comment = MockCommentSchema.parse({ id: 'COMMENT_TESTER', data: { name } })
      expect(await handleFilterComment(comment)).toBe(comment)
    })

    test('内部エラー時はフェイルオープン(コメントを返す)', async () => {
      vi.mocked(ElectronStoreManager.getInstance).mockImplementation(() => {
        throw new Error('not initialized')
      })
      const comment = makeComment()
      expect(await handleFilterComment(comment)).toBe(comment)
    })
  })

  describe('ブラックリスト方式 (isBlacklist: true)', () => {
    test('マッチ & スピーチのみ無効化なし → false', async () => {
      setPreset({ isBlacklist: true, isFilterSpeech: false })
      setMatched(true)
      expect(await handleFilterComment(makeComment())).toBe(false)
    })

    test('非マッチ → コメントをそのまま返す', async () => {
      setPreset({ isBlacklist: true, isFilterSpeech: false })
      setMatched(false)
      const comment = makeComment()
      expect(await handleFilterComment(comment)).toBe(comment)
    })

    test('マッチ & isFilterSpeech → speechText だけ消える', async () => {
      setPreset({ isBlacklist: true, isFilterSpeech: true })
      setMatched(true)
      const result = await handleFilterComment(makeComment())
      expect(result).not.toBe(false)
      expect((result as any).data.speechText).toBe('')
      expect((result as any).data.comment).toBe('test')
    })

    test('非マッチ & isFilterSpeech → 何も変えずに返す', async () => {
      setPreset({ isBlacklist: true, isFilterSpeech: true })
      setMatched(false)
      const comment = makeComment()
      const result = await handleFilterComment(comment)
      expect(result).toBe(comment)
      expect((result as any).data.speechText).toBe('test')
    })
  })

  describe('ホワイトリスト方式 (isBlacklist: false)', () => {
    test('マッチ → コメントをそのまま返す', async () => {
      setPreset({ isBlacklist: false, isFilterSpeech: false })
      setMatched(true)
      const comment = makeComment()
      expect(await handleFilterComment(comment)).toBe(comment)
    })

    test('非マッチ & スピーチのみ無効化なし → false', async () => {
      setPreset({ isBlacklist: false, isFilterSpeech: false })
      setMatched(false)
      expect(await handleFilterComment(makeComment())).toBe(false)
    })

    test('非マッチ & isFilterSpeech → speechText だけ消える', async () => {
      setPreset({ isBlacklist: false, isFilterSpeech: true })
      setMatched(false)
      const result = await handleFilterComment(makeComment())
      expect(result).not.toBe(false)
      expect((result as any).data.speechText).toBe('')
    })

    test('マッチ & isFilterSpeech → 何も変えずに返す', async () => {
      setPreset({ isBlacklist: false, isFilterSpeech: true })
      setMatched(true)
      const comment = makeComment()
      const result = await handleFilterComment(comment)
      expect(result).toBe(comment)
      expect((result as any).data.speechText).toBe('test')
    })
  })

  test('speechText を消しても、元のコメントオブジェクトは書き換えない', async () => {
    setPreset({ isBlacklist: true, isFilterSpeech: true })
    setMatched(true)
    const comment = makeComment()
    await handleFilterComment(comment)
    expect(comment.data.speechText).toBe('test')
  })
})
