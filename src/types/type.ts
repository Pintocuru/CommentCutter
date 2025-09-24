// src/type.ts
import { z } from 'zod'
import { BaseSchema } from '@shared/types/'
import { CutterThresholdSchema } from './CutterThresholdSchema'

/**
 * preset data
 */
export const PresetSchema = z.object({
  ...BaseSchema.shape,
  isBlacklist: z.boolean().default(true), // 該当したら通さない（フィルター）
  isFilterSpeech: z.boolean().default(false), // 該当したら読み上げだけフィルター
  threshold: CutterThresholdSchema.default(
    CutterThresholdSchema.parse({
      conditions: ['comment'],
      comment: ['おみくじ'],
    })
  ).catch(CutterThresholdSchema.parse({ conditions: [] })), // コメント発火条件
})

/**
 * コメントカッタープラグインの全体の型
 */
export const DataSchema = z.object({
  target: z.string().default('').catch(''), // 空文字をデフォルトに
  presets: z.record(z.string(), PresetSchema).catch({}),
})

export type DataSchemaType = z.infer<typeof DataSchema>
export type PresetType = z.infer<typeof PresetSchema>
