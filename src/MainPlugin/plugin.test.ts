// src/MainPlugin/plugin.test.ts

import { vi } from 'vitest'
import { createPinia } from 'pinia'
import plugin from './plugin'
import { checkAllConditions } from '@shared/utils/threshold/ThresholdChecker'
import { MockComment, MockCommentSchema } from '@shared/__mocks__/CreateMockComment'

// vi.mockをファイルの先頭に移動し、ファクトリー関数を使用
vi.mock('@/stores/pluginStore', () => {
  const mockStore = {
    isInitialized: true,
    hasActivePreset: true,
    currentPreset: {
      threshold: { someCondition: true },
    },
  }
  return {
    useCommentCutterStore: vi.fn(() => mockStore),
  }
})
vi.mock('@shared/sdk/postMessage/ConsolePost')
vi.mock('pinia', () => ({
  createPinia: vi.fn(() => ({
    install: vi.fn(),
  })),
}))

// mockCheckAllConditionsだけを取得
const mockCheckAllConditions = checkAllConditions as vi.MockedFunction<typeof checkAllConditions>

describe('filterComment 基本テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('正常動作: コメントが条件に一致しない場合、コメントを返す', async () => {
    const comment = MockCommentSchema.parse({ data: { isOwner: false, comment: 'test' } })

    const result = await plugin.filterComment!(comment, null as any, null)

    expect(result).toBe(comment)
  })

  test('正常動作: コメントが条件に一致する場合、falseを返す', async () => {
    const comment = MockCommentSchema.parse({ data: { isOwner: true, comment: 'test' } })

    const result = await plugin.filterComment!(comment, null as any, null)

    expect(result).toBe(false)
  })
})
